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
 * Format seconds to M:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
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

    let meta = {};
    try { meta = JSON.parse(el.dataset.wbMeta || el.dataset.meta || '{}'); } catch (e) {}

    let markers = null;
    try { markers = JSON.parse(el.dataset.wbMarkers || el.dataset.markers || 'null'); } catch (e) {}

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
        waveform: el.dataset.wbWaveform || el.dataset.waveform || '',
        markers,
        favorited: el.dataset.wbFavorited === 'true',
        inCart: el.dataset.wbInCart === 'true',
        meta
    };
}
