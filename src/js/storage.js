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
 * @param {string} key - Storage key
 * @returns {Object|null}
 */
export function restoreQueueState(key) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const d = JSON.parse(raw);
        if (!d || !d.queue || !d.queue.length) return null;
        return d;
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
