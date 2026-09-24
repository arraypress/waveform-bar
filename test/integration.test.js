import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WaveformPlayer from '@arraypress/waveform-player/no-autoinit';
import { WaveformBar } from '../src/js/core.js';

/**
 * Integration tests against the REAL @arraypress/waveform-player, not the
 * MockPlayer in bar.test.js. The mock registers nothing in `instances`, has no
 * DOM, and never dispatches request-* events, so it hid every bug that lives in
 * the seam between the bar and an inline `audioMode: 'external'` player:
 * discovery by container, event bubbling off the player's own controls, and
 * the shape of the request-play detail.
 *
 * jsdom has no media pipeline, so HTMLMediaElement's play/pause/load are
 * stubbed and playback state is driven by dispatching the audio element's own
 * `play`/`pause` events — the same path a browser takes.
 */

let bars = [];
function makeBar(config = { persist: false }) {
	const bar = new WaveformBar();
	bars.push(bar);
	bar.init(config);
	return bar;
}

/** Mount an inline external-mode player from markup, the documented way. */
function mountInline(html) {
	document.body.insertAdjacentHTML('beforeend', html);
	const el = document.body.lastElementChild.matches('[data-waveform-player]')
		? document.body.lastElementChild
		: document.body.lastElementChild.querySelector('[data-waveform-player]');
	return new WaveformPlayer(el);
}

/** Simulate the bar's own <audio> starting playback. */
function audioStarted(bar) {
	bar.player.audio.dispatchEvent(new Event('play'));
}

// The documented trigger + inline surface (waveform-docs bar/triggers.mdx):
// no `id` attribute — the player registers under a generated `wp_…` id.
const DOC_EXAMPLE = `<div data-waveform-player
	data-audio-mode="external"
	data-url="song.mp3"
	data-waveform-style="bars"
	data-wb-play
	data-wb-url="song.mp3"
	data-wb-title="My Song"></div>`;

beforeEach(() => {
	bars = [];
	window.WaveformPlayer = WaveformPlayer;
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
	vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
	vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
	document.body.innerHTML = '';
	sessionStorage.clear();
	localStorage.clear();
});

afterEach(() => {
	bars.forEach((b) => { try { b.destroy(); } catch {} });
	WaveformPlayer.destroyAll();
	vi.restoreAllMocks();
	document.body.innerHTML = '';
	sessionStorage.clear();
	localStorage.clear();
});

describe('real player: discovery of id-less inline players', () => {
	it('maps an inline player that has no id attribute', () => {
		const inline = mountInline(DOC_EXAMPLE);
		expect(inline.container.id).toBe('');          // the documented case
		const bar = makeBar();

		expect(bar._externalPlayers.get('song.mp3')?.has(inline)).toBe(true);
	});

	it('pushes the bar\'s playing state into the id-less inline player', () => {
		const inline = mountInline(DOC_EXAMPLE);
		const bar = makeBar();

		bar.play({ url: 'song.mp3', title: 'My Song' });
		audioStarted(bar);
		expect(inline.isPlaying).toBe(true);

		bar.player.audio.dispatchEvent(new Event('pause'));
		expect(inline.isPlaying).toBe(false);
	});
});

describe('real player: clicks on an inline player that is also a trigger', () => {
	it('clicking the inline play button starts the track once — no toggle back off', () => {
		const inline = mountInline(DOC_EXAMPLE);
		const bar = makeBar();
		const toggle = vi.spyOn(bar, 'togglePlay');
		const play = vi.spyOn(bar, 'play');

		inline.playBtn.click();

		// request-play carries the intent; the bubbled click must not also
		// reach the delegated [data-wb-play] handler and re-toggle.
		expect(play).toHaveBeenCalledTimes(1);
		expect(toggle).not.toHaveBeenCalled();
		expect(bar.getCurrentTrack()?.url).toBe('song.mp3');
	});

	it('a seek-click on the inline canvas seeks without pausing', () => {
		const inline = mountInline(DOC_EXAMPLE);
		const bar = makeBar();
		bar.play({ url: 'song.mp3', title: 'My Song' });
		audioStarted(bar);
		expect(bar.isPlaying).toBe(true);
		const pause = vi.spyOn(bar.player, 'pause');

		inline.canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10 }));

		expect(pause).not.toHaveBeenCalled();
		expect(bar.isPlaying).toBe(true);
	});

	it('keeps the trigger\'s data-wb-* metadata when the inline player requests play', () => {
		// The player only knows data-url; the title lives on data-wb-title.
		// With the bubbled trigger click ignored, request-play must pick the
		// trigger's metadata up itself.
		const inline = mountInline(DOC_EXAMPLE.replace('data-wb-title', 'data-wb-id="t1" data-wb-title'));
		const bar = makeBar();
		inline.playBtn.click();
		expect(bar.getCurrentTrack()).toMatchObject({ url: 'song.mp3', id: 't1', title: 'My Song' });
	});

	it('a plain [data-wb-play] trigger elsewhere still plays on click', () => {
		mountInline(DOC_EXAMPLE);
		document.body.insertAdjacentHTML('beforeend', '<button id="b" data-wb-play data-wb-url="other.mp3">Other</button>');
		const bar = makeBar();
		document.getElementById('b').click();
		expect(bar.getCurrentTrack()?.url).toBe('other.mp3');
	});
});

describe('real player: request-play detail is normalized before it reaches the queue', () => {
	const QUEUED = {
		url: 'song.mp3', id: 'sku-1', title: 'Good Title', artist: 'Real Artist',
		artwork: 'cover.jpg', markers: [{ time: 5, label: 'Drop' }],
	};

	it('does not clobber queued metadata or the favourites id with player nulls', () => {
		// Bare inline player: no title/artist/artwork/markers of its own.
		const inline = mountInline('<div data-waveform-player data-audio-mode="external" data-url="song.mp3"></div>');
		const bar = makeBar();
		bar.addToQueue({ url: 'first.mp3', title: 'First' });
		bar.addToQueue(QUEUED);

		inline.playBtn.click();

		const t = bar.getCurrentTrack();
		expect(t.url).toBe('song.mp3');
		expect(t.id).toBe('sku-1');
		expect(t.title).toBe('Good Title');
		expect(t.artist).toBe('Real Artist');
		expect(t.artwork).toBe('cover.jpg');
		expect(t.markers).toEqual([{ time: 5, label: 'Drop' }]);
		expect('player' in t).toBe(false);
	});

	it('never stores the player instance or its generated id on a new queue entry', () => {
		const inline = mountInline('<div data-waveform-player data-audio-mode="external" data-url="new.mp3" data-title="New"></div>');
		const bar = makeBar({ persist: true });

		inline.playBtn.click();

		const t = bar.getCurrentTrack();
		expect(t.url).toBe('new.mp3');
		expect(t.title).toBe('New');
		expect('player' in t).toBe(false);
		expect(t.id).toBeUndefined();              // not the container's wp_… id
		expect(bar.isFavorited()).toBe(false);     // keyed by url, stably

		// …and the persisted queue is plain, serializable track data.
		const saved = JSON.parse(sessionStorage.getItem('waveform-bar'));
		expect(saved.queue[0].url).toBe('new.mp3');
		expect(saved.queue[0].player).toBeUndefined();
	});
});

describe('real player: destroy()', () => {
	it('leaves no inline player stuck in the playing state', () => {
		const inline = mountInline(DOC_EXAMPLE);
		const bar = makeBar();
		bar.play({ url: 'song.mp3' });
		audioStarted(bar);
		expect(inline.isPlaying).toBe(true);

		bar.destroy();
		expect(inline.isPlaying).toBe(false);
	});
});
