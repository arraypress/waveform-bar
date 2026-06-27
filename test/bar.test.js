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
});
