/**
 * @module dom
 * @description DOM creation for WaveformBar
 */

import {ICONS} from './icons.js';

/**
 * Build the bar's inner HTML based on config
 * @param {Object} config
 * @returns {string}
 */
export function buildBarHTML(config) {
    // --- Left zone: controls + track info ---
    let left = '<div class="wb-left">';

    left += '<div class="wb-controls">';
    if (config.showPrevNext) {
        left += `<button class="wb-btn wb-prev" aria-label="Previous" title="Previous">${ICONS.prev}</button>`;
    }
    left += `<button class="wb-btn wb-play" aria-label="Play/Pause" title="Play">
        <span class="wb-icon-play">${ICONS.play}</span>
        <span class="wb-icon-pause" style="display:none">${ICONS.pause}</span>
    </button>`;
    if (config.showPrevNext) {
        left += `<button class="wb-btn wb-next" aria-label="Next" title="Next">${ICONS.next}</button>`;
    }
    if (config.showRepeat) {
        left += `<button class="wb-btn wb-btn-sm wb-repeat" aria-label="Repeat" title="Repeat: Off">${ICONS.repeatOff}</button>`;
    }
    left += '</div>';

    left += `<div class="wb-track">
        <div class="wb-artwork">${ICONS.music}</div>
        <div class="wb-track-text">
            <div class="wb-title">No track selected</div>
            <div class="wb-artist">&mdash;</div>
        </div>
    </div>`;
    left += '</div>';

    // --- Centre zone: waveform + time ---
    // In classic mode (`waveform: false`) the embedded player renders its own
    // built-in 'seekbar' style into this same container (see _initPlayer).
    const centre = `<div class="wb-centre">
        <div class="wb-waveform-container"></div>
        <div class="wb-time"><span class="wb-time-current">0:00</span> / <span class="wb-time-total">0:00</span></div>
    </div>`;

    // --- Right zone: meta + actions + volume + queue ---
    let right = '<div class="wb-right">';

    if (config.showMeta) {
        right += '<div class="wb-meta"></div>';
    }

    if (config.actions) {
        right += '<div class="wb-actions">';
        if (config.actions.favorite) {
            right += `<button class="wb-btn wb-btn-sm wb-fav" aria-label="Favorite" title="Favorite">${ICONS.heart}</button>`;
        }
        if (config.actions.cart) {
            right += `<button class="wb-btn wb-btn-sm wb-cart" aria-label="Add to cart" title="Add to Cart">${ICONS.cart}</button>`;
        }
        right += '</div>';
    }

    if (config.showMute || config.showVolume) {
        right += '<div class="wb-volume">';
        right += `<button class="wb-btn wb-btn-sm wb-mute" aria-label="Volume" title="Volume">${ICONS.volHigh}</button>`;
        if (config.showVolume) {
            right += `<div class="wb-volume-popup">
                <input type="range" class="wb-volume-slider" min="0" max="100" value="100" orient="vertical" aria-label="Volume">
            </div>`;
        }
        right += '</div>';
    }

    if (config.share) {
        right += `<button class="wb-btn wb-btn-sm wb-share" aria-label="Share" title="Copy share link">${ICONS.share}</button>`;
    }

    if (config.showQueue) {
        right += `<button class="wb-btn wb-btn-sm wb-queue-btn" aria-label="Queue" title="Queue">${ICONS.queue}</button>`;
    }

    right += '</div>';

    // Collapse-to-pill toggle. A direct child of .wb-inner (its own zone) so
    // the collapsed-pill CSS can hide .wb-centre/.wb-right while keeping this
    // button visible as the "expand" affordance.
    const collapse = config.collapsible
        ? `<button class="wb-btn wb-btn-sm wb-collapse" aria-label="Collapse" title="Collapse">${ICONS.collapse}</button>`
        : '';

    return `<div class="wb-inner">${left}${centre}${right}${collapse}</div>`;
}
