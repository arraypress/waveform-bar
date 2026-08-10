/**
 * @module storage
 * @description Persistence helpers for WaveformBar
 */

/**
 * Save queue state to sessionStorage
 * @param {string} key - Storage key
 * @param {Object} state - State to save
 */
export function saveQueueState(key, state) {
    try {
        sessionStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
}

/**
 * Restore queue state from sessionStorage
 *
 * The stored value is only as trustworthy as the last thing that wrote it — a
 * different bar version's format, a half-written entry, or anything else sharing
 * the key. `d.queue.length` alone passes a plain string (`'abc'.length` is 3),
 * which then throws at the first `queue.findIndex()`, so the queue is
 * shape-checked as an array of tracks with URLs before it's handed back. A
 * restored state that isn't usable is discarded rather than half-applied.
 *
 * @param {string} key - Storage key
 * @returns {Object|null}
 */
export function restoreQueueState(key) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const d = JSON.parse(raw);
        if (!d || typeof d !== 'object') return null;

        const queue = Array.isArray(d.queue)
            ? d.queue.filter(t => t && typeof t === 'object' && typeof t.url === 'string' && t.url)
            : [];
        if (!queue.length) return null;

        // currentIndex addresses the queue directly, so an out-of-range or
        // non-numeric one would strand the bar on a track that isn't there.
        const index = Number(d.currentIndex);
        return {
            ...d,
            queue,
            currentIndex: Number.isInteger(index) && index >= 0 && index < queue.length ? index : 0
        };
    } catch (e) {
        sessionStorage.removeItem(key);
        return null;
    }
}

/**
 * Save volume to localStorage (persists across sessions)
 * @param {string} key - Storage key
 * @param {number} volume
 * @param {boolean} muted
 * @param {number} volumeBeforeMute
 */
export function saveVolume(key, volume, muted, volumeBeforeMute) {
    try {
        localStorage.setItem(key + '-vol', JSON.stringify({
            v: volume, m: muted, b: volumeBeforeMute
        }));
    } catch (e) {}
}

/**
 * Restore volume from localStorage
 * @param {string} key - Storage key
 * @returns {Object|null} { volume, muted, volumeBeforeMute }
 */
export function restoreVolume(key) {
    try {
        const d = JSON.parse(localStorage.getItem(key + '-vol'));
        if (!d) return null;
        return {
            volume: d.v != null ? d.v : 1,
            muted: d.m || false,
            volumeBeforeMute: d.b || 1
        };
    } catch (e) {
        return null;
    }
}

/**
 * Save favorites to localStorage
 * @param {string} key - Storage key
 * @param {Set} favorites
 */
export function saveFavorites(key, favorites) {
    try {
        localStorage.setItem(key + '-favs', JSON.stringify([...favorites]));
    } catch (e) {}
}

/**
 * Restore favorites from localStorage
 * @param {string} key - Storage key
 * @returns {Set}
 */
export function restoreFavorites(key) {
    try {
        const d = JSON.parse(localStorage.getItem(key + '-favs'));
        return Array.isArray(d) ? new Set(d) : new Set();
    } catch (e) {
        return new Set();
    }
}
