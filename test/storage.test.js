import { describe, it, expect, beforeEach } from 'vitest';
import { saveQueueState, restoreQueueState } from '../src/js/storage.js';

/**
 * Persistence reads back whatever last wrote to the key — a different bar
 * version's format, a truncated write, or anything else sharing the storage
 * namespace. The bar treats the restored queue as an array of tracks
 * (`queue.findIndex(...)`), so a value that merely *looks* non-empty used to
 * throw during restore and leave the bar half-initialised.
 */
const KEY = 'waveform-bar-test';

beforeEach(() => {
	sessionStorage.clear();
});

describe('restoreQueueState', () => {
	it('restores a well-formed queue', () => {
		sessionStorage.setItem(KEY, JSON.stringify({
			queue: [{ url: '/a.mp3', title: 'A' }, { url: '/b.mp3', title: 'B' }],
			currentIndex: 1
		}));

		const state = restoreQueueState(KEY);
		expect(state.queue).toHaveLength(2);
		expect(state.currentIndex).toBe(1);
	});

	it('returns null when nothing is stored', () => {
		expect(restoreQueueState(KEY)).toBe(null);
	});

	it('returns null for malformed JSON, and clears the poisoned key', () => {
		sessionStorage.setItem(KEY, '{not json');
		expect(restoreQueueState(KEY)).toBe(null);
		expect(sessionStorage.getItem(KEY)).toBe(null);
	});

	it('rejects a queue that is not an array (a string has a truthy length)', () => {
		sessionStorage.setItem(KEY, JSON.stringify({ queue: 'abc', currentIndex: 0 }));
		expect(restoreQueueState(KEY)).toBe(null);
	});

	it('rejects a stored value that is not an object', () => {
		sessionStorage.setItem(KEY, '"just a string"');
		expect(restoreQueueState(KEY)).toBe(null);
		sessionStorage.setItem(KEY, '42');
		expect(restoreQueueState(KEY)).toBe(null);
	});

	it('drops queue entries without a usable url', () => {
		sessionStorage.setItem(KEY, JSON.stringify({
			queue: [null, { title: 'no url' }, { url: '' }, 'nope', { url: '/good.mp3' }],
			currentIndex: 0
		}));

		const state = restoreQueueState(KEY);
		expect(state.queue).toEqual([{ url: '/good.mp3' }]);
	});

	it('returns null when no entry survives filtering', () => {
		sessionStorage.setItem(KEY, JSON.stringify({ queue: [null, { title: 'x' }], currentIndex: 0 }));
		expect(restoreQueueState(KEY)).toBe(null);
	});

	it('resets a currentIndex that does not address the restored queue', () => {
		const store = (currentIndex) => sessionStorage.setItem(KEY, JSON.stringify({
			queue: [{ url: '/a.mp3' }], currentIndex
		}));

		store(7);
		expect(restoreQueueState(KEY).currentIndex).toBe(0);
		store(-1);
		expect(restoreQueueState(KEY).currentIndex).toBe(0);
		store('two');
		expect(restoreQueueState(KEY).currentIndex).toBe(0);
		store(undefined);
		expect(restoreQueueState(KEY).currentIndex).toBe(0);
	});

	it('preserves other persisted fields', () => {
		sessionStorage.setItem(KEY, JSON.stringify({
			queue: [{ url: '/a.mp3' }], currentIndex: 0, currentTime: 42, isPlaying: false
		}));

		expect(restoreQueueState(KEY).currentTime).toBe(42);
	});

	it('round-trips what saveQueueState writes', () => {
		saveQueueState(KEY, {
			queue: [{ url: '/a.mp3', title: 'A' }],
			currentIndex: 0,
			currentTime: 12,
			isPlaying: false
		});

		const state = restoreQueueState(KEY);
		expect(state).not.toBe(null);
		expect(state.queue[0].url).toBe('/a.mp3');
	});
});
