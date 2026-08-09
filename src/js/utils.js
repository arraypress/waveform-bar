/**
 * @module utils
 * @description Utility functions for WaveformBar
 */

/**
 * Extract a display title from a URL
 * @param {string} url
 * @returns {string}
 */
export function extractTitle(url) {
    if (!url) return 'Untitled';
    return url.split('/').pop().split('.')[0]
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

/**
 * Whether a URL is safe to navigate to (assign to `location.href`).
 * Allows only `http`/`https` and relative URLs, rejecting `javascript:`,
 * `data:`, `blob:`, `vbscript:` and other script-bearing schemes.
 *
 * TODO(harden): adopt `WaveformPlayer.utils.isSafeHref` once the peer dep
 * is bumped to ^1.8.0 (which ships this helper). Inlined here so the
 * open-redirect / XSS guard is fixed without a peer bump.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeHref(url) {
    if (typeof url !== 'string' || url === '') return false;
    try {
        // Resolve relative URLs against the current document; only the
        // scheme matters for the safety decision.
        const u = new URL(url, location.href);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

/**
 * Format seconds to M:SS.
 *
 * Falsy, non-numeric, non-finite and negative inputs all render as `'0:00'`.
 * `Infinity` is the one that bites: a streamed or unseekable source reports
 * `audio.duration === Infinity`, which is truthy and not `NaN`, and
 * `Infinity % 60` is `NaN` — so the old guard put a literal `'Infinity:NaN'`
 * in the bar's time display.
 *
 * Note this stays M:SS past an hour (a 65-minute track reads `65:00`), unlike
 * the core player's `formatTime`, which rolls over to H:MM:SS.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
    const total = Number(seconds);
    if (!total || !Number.isFinite(total) || total < 0) return '0:00';
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Parse track metadata from a trigger element
 * @param {HTMLElement} el
 * @returns {Object|null}
 */
export function parseTrackFromElement(el) {
    const url = el.dataset.wbUrl || el.dataset.url;
    if (!url) return null;

    // Parse + shape-coerce. JSON.parse only validates the syntax — a value
    // like '"x"' or '[1,2]' parses cleanly but is the wrong shape and would
    // strand the bar downstream (e.g. `.map()` on a non-array). Coerce each
    // field to the shape the rest of the code expects.
    let meta = {};
    try {
        const parsed = JSON.parse(el.dataset.wbMeta || el.dataset.meta || '{}');
        meta = (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {}

    let markers = [];
    try {
        const parsed = JSON.parse(el.dataset.wbMarkers || el.dataset.markers || 'null');
        markers = Array.isArray(parsed) ? parsed : [];
    } catch (e) {}
    // Coerce each marker time to a finite number; drop entries that aren't
    // usable objects or whose time can't be parsed.
    markers = markers
        .map(m => (m && typeof m === 'object') ? {...m, time: Number(m.time)} : null)
        .filter(m => m && Number.isFinite(m.time));

    let waveform = null;
    try {
        const parsed = JSON.parse(el.dataset.wbWaveform || el.dataset.waveform || 'null');
        waveform = Array.isArray(parsed) ? parsed : null;
    } catch (e) {}

    return {
        url,
        id: el.dataset.wbId || el.dataset.id || url,
        title: el.dataset.wbTitle || el.dataset.title || extractTitle(url),
        artist: el.dataset.wbArtist || el.dataset.artist || '',
        artwork: el.dataset.wbArtwork || el.dataset.artwork || '',
        album: el.dataset.wbAlbum || el.dataset.album || '',
        link: el.dataset.wbLink || el.dataset.link || '',
        duration: el.dataset.wbDuration || el.dataset.duration || '',
        bpm: el.dataset.wbBpm || el.dataset.bpm || '',
        key: el.dataset.wbKey || el.dataset.key || '',
        waveform,
        markers,
        favorited: el.dataset.wbFavorited === 'true',
        inCart: el.dataset.wbInCart === 'true',
        meta
    };
}
