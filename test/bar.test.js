import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WaveformBar } from '../src/js/core.js';

/**
 * Minimal stand-in for the external @arraypress/waveform-player peer. The bar
 * only needs a constructable object with the handful of methods it calls plus
 * a static `instances` Map for external-player discovery. We capture the last
 * instance so tests can invoke the option callbacks (e.g. onError) the bar
 * wired up.
 */
class MockPlayer {
	constructor(container, opts) {
		this.container = container;
		this.options = opts;
		this.audio = { currentTime: 0, duration: 0 };
		this.loadCalls = [];
		MockPlayer.last = this;
	}
	loadTrack(url, title, artist, opts) {
		this.loadCalls.push({ url, title, artist, opts });
		return Promise.resolve();
	}
	setVolume(v) { this.volume = v; }
	play() { return Promise.resolve(); }
	pause() {}
	seekTo() {}
	seekToPercent() {}
	destroy() {}
}

let bars = [];
function makeBar(config = { persist: false }) {
	const bar = new WaveformBar();
	bars.push(bar);
	bar.init(config);
	return bar;
}

beforeEach(() => {
	bars = [];
	MockPlayer.last = null;
	MockPlayer.instances = new Map();
	window.WaveformPlayer = MockPlayer;
	document.body.innerHTML = '';
	sessionStorage.clear();
	localStorage.clear();
});

afterEach(() => {
	bars.forEach((b) => { try { b.destroy(); } catch {} });
	document.body.innerHTML = '';
	sessionStorage.clear();
	localStorage.clear();
});

describe('delegated trigger binding', () => {
	it('plays on a delegated click and survives destroy()+init() without double-firing', () => {
		document.body.innerHTML = '<button data-wb-play data-wb-url="a.mp3" data-wb-title="A">Play</button>';
		const bar = makeBar();

		const spy1 = vi.spyOn(bar, 'play');
		document.querySelector('[data-wb-play]').click();
		expect(spy1).toHaveBeenCalledTimes(1);
		expect(bar.getCurrentTrack()?.url).toBe('a.mp3');
		spy1.mockRestore();

		// The old per-element binding leaked a second handler on every
		// re-init, so a single click fired twice (and the two toggled each
		// other so nothing happened). Delegation must keep it at exactly one.
		bar.destroy();
		bar.init({ persist: false });
		const spy2 = vi.spyOn(bar, 'play');
		document.querySelector('[data-wb-play]').click();
		expect(spy2).toHaveBeenCalledTimes(1);
	});

	it('enqueues (not plays) when a data-wb-queue trigger is clicked', () => {
		document.body.innerHTML = '<button data-wb-queue data-wb-url="q.mp3" data-wb-title="Q">Queue</button>';
		const bar = makeBar();
		const playSpy = vi.spyOn(bar, 'play');
		const queueSpy = vi.spyOn(bar, 'addToQueue');
		document.querySelector('[data-wb-queue]').click();
		expect(queueSpy).toHaveBeenCalledTimes(1);
		expect(playSpy).not.toHaveBeenCalled();
		expect(bar.getQueue().map((t) => t.url)).toContain('q.mp3');
	});

	it('binds triggers mounted AFTER init (delegation, no re-bind needed)', () => {
		const bar = makeBar();
		// Late-mounted trigger — there was no element at init time.
		document.body.insertAdjacentHTML('beforeend', '<button data-wb-play data-wb-url="late.mp3">Late</button>');
		document.querySelector('[data-wb-play]').click();
		expect(bar.getCurrentTrack()?.url).toBe('late.mp3');
	});
});

describe('destroy() listener teardown', () => {
	it('removes the delegated trigger + external request-play document listeners', () => {
		document.body.innerHTML = '<button data-wb-play data-wb-url="a.mp3">Play</button>';
		const bar = makeBar();
		bar.destroy();

		const playSpy = vi.spyOn(bar, 'play');
		// Delegated click listener should be gone.
		document.querySelector('[data-wb-play]').click();
		// External request-play listener should be gone.
		document.dispatchEvent(new CustomEvent('waveformplayer:request-play', { detail: { url: 'a.mp3' } }));
		expect(playSpy).not.toHaveBeenCalled();
	});

	it('clears the external players map', () => {
		const bar = makeBar();
		bar._externalPlayers.set('x.mp3', new Set([{}]));
		bar.destroy();
		expect(bar._externalPlayers.size).toBe(0);
	});
});

describe('external player request events', () => {
	it('routes waveformplayer:request-play into the bar', () => {
		const bar = makeBar();
		document.dispatchEvent(new CustomEvent('waveformplayer:request-play', {
			detail: { url: 'ext.mp3', title: 'Ext' },
		}));
		expect(bar.getCurrentTrack()?.url).toBe('ext.mp3');
	});
});

describe('onError handling', () => {
	it('skips a dead track to the next queue entry when continuous, emitting waveformbar:error', () => {
		const bar = makeBar({ persist: false, continuous: true });
		bar.addToQueue({ url: 'a.mp3', title: 'A' });
		bar.addToQueue({ url: 'b.mp3', title: 'B' });
		expect(bar.getCurrentIndex()).toBe(0);

		let errored = null;
		document.addEventListener('waveformbar:error', (e) => { errored = e.detail; }, { once: true });

		// Simulate the embedded player reporting a load/decode failure.
		expect(typeof bar.player.options.onError).toBe('function');
		bar.player.options.onError();

		expect(errored?.track?.url).toBe('a.mp3');
		expect(bar.isPlaying).toBe(false);
		expect(bar.getCurrentIndex()).toBe(1);
		expect(bar.getCurrentTrack().url).toBe('b.mp3');
	});

	it('does not throw or advance past the end on the last track', () => {
		const bar = makeBar({ persist: false, continuous: true });
		bar.addToQueue({ url: 'only.mp3', title: 'Only' });
		expect(() => bar.player.options.onError()).not.toThrow();
		expect(bar.getCurrentIndex()).toBe(0);
	});
});

describe('malformed markers do not strand the bar', () => {
	it('plays a trigger with malformed markers JSON without throwing', () => {
		document.body.innerHTML =
			'<button data-wb-play data-wb-url="a.mp3" data-wb-markers=\'"x"\'>Play</button>';
		const bar = makeBar();
		expect(() => document.querySelector('[data-wb-play]').click()).not.toThrow();
		expect(bar.getCurrentTrack().url).toBe('a.mp3');
	});
});

describe('volume coercion', () => {
	const volFor = (volume) => {
		const bar = makeBar({ volume, persist: false });
		return bar.volume;
	};

	it('clamps out-of-range and guards NaN/non-numeric from config', () => {
		expect(volFor(5)).toBe(1);
		expect(volFor(-2)).toBe(0);
		expect(volFor(NaN)).toBe(1);
		expect(volFor('loud')).toBe(1);
		expect(volFor(0.4)).toBe(0.4);
	});

	it('clamps a corrupted persisted volume on restore', () => {
		localStorage.setItem('waveform-bar-vol', JSON.stringify({ v: 9, m: false, b: 1 }));
		const bar = makeBar({ persist: true });
		expect(bar.volume).toBe(1);
	});
});

describe('shareable timestamps', () => {
	it('renders the share button only when share:true', () => {
		const off = makeBar({ persist: false });
		expect(off.barEl.querySelector('.wb-share')).toBe(null);
		off.destroy();
		const on = makeBar({ persist: false, share: true });
		expect(on.barEl.querySelector('.wb-share')).toBeTruthy();
	});

	it('copies a link with the current timestamp and emits waveformbar:share', () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
		const bar = makeBar({ persist: false, share: true });
		MockPlayer.last.audio.currentTime = 42;
		let ev = null;
		document.addEventListener('waveformbar:share', (e) => { ev = e; }, { once: true });

		bar.barEl.querySelector('.wb-share').click();

		expect(writeText).toHaveBeenCalledTimes(1);
		expect(writeText.mock.calls[0][0]).toMatch(/[?&]wt=42\b/);
		expect(ev?.detail.time).toBe(42);
	});

	it('seeks the first-loaded track to ?wt= exactly once', () => {
		history.replaceState({}, '', '/?wt=90');
		const bar = makeBar({ persist: false });
		const player = MockPlayer.last;
		const seekSpy = vi.spyOn(player, 'seekTo');

		player.options.onLoad();              // simulate first track finishing load
		expect(seekSpy).toHaveBeenCalledWith(90);

		seekSpy.mockClear();
		player.options.onLoad();              // already applied — no second seek
		expect(seekSpy).not.toHaveBeenCalled();

		history.replaceState({}, '', '/');    // reset for other tests
	});

	it('share link embeds the track identity (wid + wu + wtitle)', () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
		document.body.innerHTML =
			'<button data-wb-play data-wb-id="beat1" data-wb-url="x.mp3" data-wb-title="Beat One" data-wb-artist="DJ">Play</button>';
		const bar = makeBar({ persist: false, share: true });
		document.querySelector('[data-wb-play]').click();   // make it the current track
		MockPlayer.last.audio.currentTime = 12;

		bar.barEl.querySelector('.wb-share').click();
		const link = writeText.mock.calls.at(-1)[0];
		expect(link).toMatch(/[?&]wt=12\b/);
		expect(link).toMatch(/[?&]wid=beat1\b/);
		expect(link).toContain('wu=x.mp3');
		expect(link).toMatch(/wtitle=Beat(\+|%20)One/);
	});

	it('cold-loads a shared track by id (paused) and seeks after load', async () => {
		document.body.innerHTML =
			'<button data-wb-play data-wb-id="beat1" data-wb-url="x.mp3" data-wb-title="Beat One">Play</button>';
		history.replaceState({}, '', '/?wt=70&wid=beat1');
		const bar = makeBar({ persist: false });
		const player = MockPlayer.last;

		expect(bar.getCurrentTrack()?.url).toBe('x.mp3');
		expect(player.loadCalls.at(-1).opts.autoplay).toBe(false);   // paused, not autoplay

		const seekSpy = vi.spyOn(player, 'seekTo');
		await Promise.resolve();                       // run loadTrack().then()
		await new Promise((r) => setTimeout(r, 130));  // pass the 100ms seek delay
		expect(seekSpy).toHaveBeenCalledWith(70);

		history.replaceState({}, '', '/');
	});

	it('falls back to the embedded url when the page has no matching trigger', () => {
		history.replaceState({}, '', '/?wt=5&wu=' + encodeURIComponent('https://cdn.example/x.mp3') + '&wtitle=Cold');
		const bar = makeBar({ persist: false });
		const track = bar.getCurrentTrack();
		expect(track?.url).toBe('https://cdn.example/x.mp3');
		expect(track?.title).toBe('Cold');
		history.replaceState({}, '', '/');
	});

	it('refuses to load an unsafe embedded url', () => {
		history.replaceState({}, '', '/?wt=5&wu=' + encodeURIComponent('javascript:alert(1)'));
		const bar = makeBar({ persist: false });
		expect(bar.getCurrentTrack()).toBe(null);
		expect(MockPlayer.last.loadCalls.length).toBe(0);
		history.replaceState({}, '', '/');
	});
});

describe('layout modes: position / classic / collapse', () => {
	it('docks to the top edge when position:"top"', () => {
		const bar = makeBar({ persist: false, position: 'top' });
		expect(bar.barEl.classList.contains('wb-top')).toBe(true);
	});

	it("classic mode (waveform:false) uses the player's built-in seekbar style", () => {
		const bar = makeBar({ persist: false, waveform: false });
		expect(MockPlayer.last.options.waveformStyle).toBe('seekbar');
		expect(bar.barEl.querySelector('.wb-seekbar')).toBe(null);   // no custom seek-bar DOM
	});

	it('default waveform mode passes the configured style through to the player', () => {
		const bar = makeBar({ persist: false });
		expect(MockPlayer.last.options.waveformStyle).toBe('mirror');  // DEFAULTS.waveformStyle
	});

	it('collapse/expand toggles the pill class and emits waveformbar:collapse', () => {
		const bar = makeBar({ persist: false, collapsible: true });
		const btn = bar.barEl.querySelector('.wb-collapse');
		expect(btn).toBeTruthy();
		let last = null;
		const onCollapse = (e) => { last = e.detail.collapsed; };
		document.addEventListener('waveformbar:collapse', onCollapse);

		btn.click();
		expect(bar.isCollapsed).toBe(true);
		expect(bar.barEl.classList.contains('wb-collapsed')).toBe(true);
		expect(last).toBe(true);

		btn.click();
		expect(bar.barEl.classList.contains('wb-collapsed')).toBe(false);
		expect(last).toBe(false);

		document.removeEventListener('waveformbar:collapse', onCollapse);
	});

	it('restores a persisted collapsed state on init', () => {
		sessionStorage.setItem('waveform-bar-collapsed', '1');
		const bar = makeBar({ persist: true, collapsible: true });
		expect(bar.isCollapsed).toBe(true);
		expect(bar.barEl.classList.contains('wb-collapsed')).toBe(true);
	});

	it('shows no collapse button unless collapsible:true', () => {
		const bar = makeBar({ persist: false });
		expect(bar.barEl.querySelector('.wb-collapse')).toBe(null);
	});

	it('collapsed pill keeps the transport controls (prev/play/next) visible', () => {
		const bar = makeBar({ persist: false, collapsible: true });
		bar.collapse();
		// The controls cluster + expand button stay; track/centre/right hide via CSS.
		expect(bar.barEl.querySelector('.wb-controls .wb-play')).toBeTruthy();
		expect(bar.barEl.querySelector('.wb-prev')).toBeTruthy();
		expect(bar.barEl.querySelector('.wb-next')).toBeTruthy();
		expect(bar.barEl.querySelector('.wb-collapse')).toBeTruthy();
	});
});

describe('layout: "center" (3-column Spotify-style)', () => {
	it('default layout keeps the transport in the left zone, no center class', () => {
		const bar = makeBar({ persist: false });
		expect(bar.barEl.classList.contains('wb-layout-center')).toBe(false);
		expect(bar.barEl.querySelector('.wb-left .wb-controls .wb-play')).toBeTruthy();
		expect(bar.barEl.querySelector('.wb-centre .wb-time')).toBeTruthy();
	});

	it('adds wb-layout-center and moves the transport into the centre column', () => {
		const bar = makeBar({ persist: false, layout: 'center' });
		expect(bar.barEl.classList.contains('wb-layout-center')).toBe(true);
		// Transport now lives in the centre column...
		expect(bar.barEl.querySelector('.wb-centre .wb-controls .wb-play')).toBeTruthy();
		expect(bar.barEl.querySelector('.wb-left .wb-controls')).toBe(null);
		// ...above a seek row with the time labels flanking the waveform.
		const seek = bar.barEl.querySelector('.wb-centre .wb-seek');
		expect(seek).toBeTruthy();
		expect(seek.querySelector('.wb-time-current')).toBeTruthy();
		expect(seek.querySelector('.wb-waveform-container')).toBeTruthy();
		expect(seek.querySelector('.wb-time-total')).toBeTruthy();
		// Now-playing stays on the left.
		expect(bar.barEl.querySelector('.wb-left .wb-track')).toBeTruthy();
	});

	it('preserves all control classes so the existing wiring still binds', () => {
		const bar = makeBar({ persist: false, layout: 'center' });
		for (const sel of ['.wb-play', '.wb-prev', '.wb-next', '.wb-repeat', '.wb-queue-btn', '.wb-mute', '.wb-waveform-container', '.wb-time-current', '.wb-time-total']) {
			expect(bar.barEl.querySelector(sel)).toBeTruthy();
		}
		// Clicking play still resolves a bound handler (proves class-based wiring).
		expect(() => bar.barEl.querySelector('.wb-play').click()).not.toThrow();
	});

	it('coerces an unknown layout value to default', () => {
		const bar = makeBar({ persist: false, layout: 'bogus' });
		expect(bar.config.layout).toBe('default');
		expect(bar.barEl.classList.contains('wb-layout-center')).toBe(false);
	});

	it('mode:"classic" centres the layout AND uses the seekbar', () => {
		const bar = makeBar({ persist: false, mode: 'classic' });
		expect(bar.config.mode).toBe('classic');
		expect(bar.config.layout).toBe('center');
		expect(bar.barEl.classList.contains('wb-layout-center')).toBe(true);
		expect(MockPlayer.last.options.waveformStyle).toBe('seekbar');
	});

	it('mode:"waveform" (default) keeps the default layout + waveform', () => {
		const bar = makeBar({ persist: false });
		expect(bar.config.mode).toBe('waveform');
		expect(bar.barEl.classList.contains('wb-layout-center')).toBe(false);
		expect(MockPlayer.last.options.waveformStyle).toBe('mirror');
	});

	it('legacy waveform:false infers classic mode', () => {
		const bar = makeBar({ persist: false, waveform: false });
		expect(bar.config.mode).toBe('classic');
		expect(bar.barEl.classList.contains('wb-layout-center')).toBe(true);
		expect(MockPlayer.last.options.waveformStyle).toBe('seekbar');
	});

	it('keeps the collapse button a direct .wb-inner child in center layout', () => {
		// In center mode .wb-inner is a grid; the collapse button must stay a
		// direct child (its own 4th `auto` track) rather than nest in a zone,
		// so it never spills into an implicit second row.
		const bar = makeBar({ persist: false, layout: 'center', collapsible: true });
		const inner = bar.barEl.querySelector('.wb-inner');
		const collapse = bar.barEl.querySelector('.wb-collapse');
		expect(collapse).toBeTruthy();
		expect(collapse.parentElement).toBe(inner);
		expect(bar.barEl.classList.contains('wb-layout-center')).toBe(true);
	});
});

describe('shuffle (showShuffle / shuffle)', () => {
	it('shows no shuffle button unless showShuffle:true', () => {
		const bar = makeBar({ persist: false });
		expect(bar.barEl.querySelector('.wb-shuffle')).toBe(null);
	});

	it('renders a shuffle button in the transport when showShuffle:true', () => {
		const bar = makeBar({ persist: false, showShuffle: true });
		expect(bar.barEl.querySelector('.wb-controls .wb-shuffle')).toBeTruthy();
	});

	it('toggles shuffle state + class + emits shufflechange on click', () => {
		const bar = makeBar({ persist: false, showShuffle: true });
		const btn = bar.barEl.querySelector('.wb-shuffle');
		let last = null;
		const onChange = (e) => { last = e.detail.shuffle; };
		document.addEventListener('waveformbar:shufflechange', onChange);

		btn.click();
		expect(bar.shuffle).toBe(true);
		expect(btn.classList.contains('wb-shuffle-active')).toBe(true);
		expect(btn.getAttribute('aria-pressed')).toBe('true');
		expect(last).toBe(true);

		btn.click();
		expect(bar.shuffle).toBe(false);
		expect(btn.classList.contains('wb-shuffle-active')).toBe(false);
		expect(last).toBe(false);

		document.removeEventListener('waveformbar:shufflechange', onChange);
	});

	it('seeds shuffle state from config.shuffle', () => {
		const bar = makeBar({ persist: false, showShuffle: true, shuffle: true });
		expect(bar.shuffle).toBe(true);
		expect(bar.barEl.querySelector('.wb-shuffle').classList.contains('wb-shuffle-active')).toBe(true);
	});

	it('honors config.shuffle even when showShuffle is false (no button)', () => {
		const bar = makeBar({ persist: false, shuffle: true, showShuffle: false });
		expect(bar.barEl.querySelector('.wb-shuffle')).toBe(null); // no toggle rendered
		expect(bar.shuffle).toBe(true); // ...but random advance is still active
	});

	it('_randomIndex returns an in-range index other than the current', () => {
		const bar = makeBar({ persist: false });
		bar.queue = [{ url: 'a' }, { url: 'b' }, { url: 'c' }];
		bar.currentIndex = 1;
		for (let n = 0; n < 25; n++) {
			const i = bar._randomIndex();
			expect(i).toBeGreaterThanOrEqual(0);
			expect(i).toBeLessThan(3);
			expect(i).not.toBe(1);
		}
	});

	it('next() jumps to a random track when shuffle is on', () => {
		const bar = makeBar({ persist: false });
		bar.queue = [{ url: 'a' }, { url: 'b' }, { url: 'c' }];
		bar.currentIndex = 0;
		bar.shuffle = true;
		bar._loadCurrentTrack = vi.fn(); // isolate the advance logic
		const rnd = vi.spyOn(Math, 'random').mockReturnValue(0.9); // floor(0.9*3) = 2
		bar.next();
		expect(bar.currentIndex).toBe(2);
		expect(bar._loadCurrentTrack).toHaveBeenCalledTimes(1);
		rnd.mockRestore();
	});

	it('next() stays sequential when shuffle is off', () => {
		const bar = makeBar({ persist: false });
		bar.queue = [{ url: 'a' }, { url: 'b' }, { url: 'c' }];
		bar.currentIndex = 0;
		bar._loadCurrentTrack = vi.fn();
		bar.next();
		expect(bar.currentIndex).toBe(1);
	});
});
