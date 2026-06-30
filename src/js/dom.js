/**
 * @module dom
 * @description DOM creation for WaveformBar
 */

import {ICONS} from './icons.js';

/**
 * Transport cluster: prev / play / next / repeat. Shared by both layouts —
 * the `center` layout simply places this in the middle column instead of
 * the left zone. Class names are identical across layouts so the JS wiring
 * (which selects purely by class) never changes.
 * @param {Object} config
 * @returns {string}
 */
function buildControls(config) {
    let s = '<div class="wb-controls">';
    if (config.showShuffle) {
        s += `<button class="wb-btn wb-btn-sm wb-shuffle" aria-label="Shuffle" title="Shuffle: Off" aria-pressed="false">${ICONS.shuffle}</button>`;
    }
    if (config.showPrevNext) {
        s += `<button class="wb-btn wb-prev" aria-label="Previous" title="Previous">${ICONS.prev}</button>`;
    }
    s += `<button class="wb-btn wb-play" aria-label="Play/Pause" title="Play"><span class="wb-icon-play">${ICONS.play}</span><span class="wb-icon-pause" style="display:none">${ICONS.pause}</span></button>`;
    if (config.showPrevNext) {
        s += `<button class="wb-btn wb-next" aria-label="Next" title="Next">${ICONS.next}</button>`;
    }
    if (config.showRepeat) {
        s += `<button class="wb-btn wb-btn-sm wb-repeat" aria-label="Repeat" title="Repeat: Off">${ICONS.repeatOff}</button>`;
    }
    s += '</div>';
    return s;
}

/** Now-playing block: artwork + title/artist. */
function buildTrack() {
    return `<div class="wb-track">
        <div class="wb-artwork">${ICONS.music}</div>
        <div class="wb-track-text">
            <div class="wb-title">No track selected</div>
            <div class="wb-artist">&mdash;</div>
        </div>
    </div>`;
}

/** Meta-tags container (filled by _renderMeta). */
function buildMeta(config) {
    return config.showMeta ? '<div class="wb-meta"></div>' : '';
}

/**
 * Secondary controls — actions (fav/cart) + volume + share + queue button.
 * Returned WITHOUT the `.wb-right` wrapper so each layout can place them.
 * @param {Object} config
 * @returns {string}
 */
function buildRightControls(config) {
    let s = '';

    if (config.actions) {
        s += '<div class="wb-actions">';
        if (config.actions.favorite) {
            s += `<button class="wb-btn wb-btn-sm wb-fav" aria-label="Favorite" title="Favorite">${ICONS.heart}</button>`;
        }
        if (config.actions.cart) {
            s += `<button class="wb-btn wb-btn-sm wb-cart" aria-label="Add to cart" title="Add to Cart">${ICONS.cart}</button>`;
        }
        s += '</div>';
    }

    if (config.showMute || config.showVolume) {
        s += '<div class="wb-volume">';
        s += `<button class="wb-btn wb-btn-sm wb-mute" aria-label="Volume" title="Volume">${ICONS.volHigh}</button>`;
        if (config.showVolume) {
            s += `<div class="wb-volume-popup">
                <input type="range" class="wb-volume-slider" min="0" max="100" value="100" aria-label="Volume">
            </div>`;
        }
        s += '</div>';
    }

    if (config.share) {
        s += `<button class="wb-btn wb-btn-sm wb-share" aria-label="Share" title="Copy share link">${ICONS.share}</button>`;
    }

    if (config.showQueue) {
        s += `<button class="wb-btn wb-btn-sm wb-queue-btn" aria-label="Queue" title="Queue">${ICONS.queue}</button>`;
    }

    return s;
}

/**
 * Collapse-to-pill toggle. A direct child of .wb-inner (its own zone) so
 * the collapsed-pill CSS can hide the other zones while keeping this button
 * visible as the "expand" affordance.
 */
function buildCollapse(config) {
    return config.collapsible
        ? `<button class="wb-btn wb-btn-sm wb-collapse" aria-label="Collapse" title="Collapse">${ICONS.collapse}</button>`
        : '';
}

/**
 * Build the bar's inner HTML based on config.
 *
 * Two layouts (`config.layout`):
 *  - `'default'` — transport + track on the left, waveform + time in the
 *    flexible centre, secondary controls on the right.
 *  - `'center'`  — Spotify-style 3 columns: now-playing on the left, the
 *    transport centred ABOVE a full-width seek row in the middle, and the
 *    secondary controls on the right.
 *
 * Both layouts emit the exact same elements / class names — only the
 * grouping + order differ — so `_createBar`'s class-based ref caching and
 * event binding work identically for either.
 *
 * @param {Object} config
 * @returns {string}
 */
export function buildBarHTML(config) {
    const controls = buildControls(config);
    const track = buildTrack();
    const meta = buildMeta(config);
    const rightControls = buildRightControls(config);
    const collapse = buildCollapse(config);

    if (config.layout === 'center') {
        // LEFT: now-playing (+ meta). CENTRE: transport row above a seek row
        // whose time labels flank the waveform (elapsed left, total right).
        // RIGHT: the secondary controls.
        const left = `<div class="wb-left">${track}${meta}</div>`;
        const centre = `<div class="wb-centre">${controls}<div class="wb-seek"><span class="wb-time-current">0:00</span><div class="wb-waveform-container"></div><span class="wb-time-total">0:00</span></div></div>`;
        const right = `<div class="wb-right">${rightControls}</div>`;
        return `<div class="wb-inner">${left}${centre}${right}${collapse}</div>`;
    }

    // --- Default layout ---
    // Centre: in classic mode (`waveform: false`) the embedded player renders
    // its own built-in 'seekbar' style into this same container (see _initPlayer).
    const left = `<div class="wb-left">${controls}${track}</div>`;
    const centre = `<div class="wb-centre">
        <div class="wb-waveform-container"></div>
        <div class="wb-time"><span class="wb-time-current">0:00</span> / <span class="wb-time-total">0:00</span></div>
    </div>`;
    const right = `<div class="wb-right">${meta}${rightControls}</div>`;
    return `<div class="wb-inner">${left}${centre}${right}${collapse}</div>`;
}
