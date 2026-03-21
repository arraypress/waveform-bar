/**
 * @module queue
 * @description Queue panel rendering for WaveformBar
 */

import {ICONS} from './icons.js';
import {escapeHtml} from './utils.js';

/**
 * Create the queue panel DOM element
 * @returns {HTMLElement}
 */
export function createQueuePanel() {
    const el = document.createElement('div');
    el.className = 'wb-queue-panel';
    el.innerHTML = `
        <div class="wb-queue-header">
            <div class="wb-queue-title">
                ${ICONS.queue}
                Queue
                <span class="wb-queue-count">0</span>
            </div>
            <button class="wb-btn wb-btn-sm wb-queue-clear" aria-label="Clear queue">Clear</button>
        </div>
        <div class="wb-queue-body"></div>
    `;
    return el;
}

/**
 * Render queue panel contents
 * @param {HTMLElement} bodyEl - Queue body element
 * @param {HTMLElement} countEl - Queue count badge element
 * @param {Array} queue - Queue array
 * @param {number} currentIndex - Current playing index
 * @param {Object} callbacks - { onSkipTo, onRemove }
 */
export function renderQueue(bodyEl, countEl, queue, currentIndex, callbacks) {
    if (!bodyEl) return;

    const upcoming = Math.max(0, queue.length - 1 - currentIndex);
    if (countEl) countEl.textContent = upcoming;

    if (queue.length === 0) {
        bodyEl.innerHTML = `<div class="wb-queue-empty">${ICONS.queue}<p>Queue is empty</p></div>`;
        return;
    }

    let html = '';

    // Now playing
    if (currentIndex >= 0 && currentIndex < queue.length) {
        const current = queue[currentIndex];
        html += '<div class="wb-queue-label">Now Playing</div>';
        html += `<div class="wb-queue-item wb-queue-current" data-qi="${currentIndex}">
            <span class="wb-queue-num">${ICONS.speaker}</span>
            <div class="wb-queue-info">
                <div class="wb-queue-item-title">${escapeHtml(current.title)}</div>
                <div class="wb-queue-item-artist">${escapeHtml(current.artist)}</div>
            </div>
        </div>`;
    }

    // Next up
    let hasNext = false;
    for (let i = currentIndex + 1; i < queue.length; i++) {
        if (!hasNext) {
            html += '<div class="wb-queue-label">Next Up</div>';
            hasNext = true;
        }
        const t = queue[i];
        html += `<div class="wb-queue-item" data-qi="${i}">
            <span class="wb-queue-num">${i - currentIndex}</span>
            <div class="wb-queue-info">
                <div class="wb-queue-item-title">${escapeHtml(t.title)}</div>
                <div class="wb-queue-item-artist">${escapeHtml(t.artist)}</div>
            </div>
            <button class="wb-queue-remove" data-qi="${i}" aria-label="Remove">${ICONS.close}</button>
        </div>`;
    }

    // Previously played
    if (currentIndex > 0) {
        html += '<div class="wb-queue-label">Previously Played</div>';
        for (let j = currentIndex - 1; j >= 0; j--) {
            const t = queue[j];
            html += `<div class="wb-queue-item wb-queue-played" data-qi="${j}">
                <span class="wb-queue-num">${j + 1}</span>
                <div class="wb-queue-info">
                    <div class="wb-queue-item-title">${escapeHtml(t.title)}</div>
                    <div class="wb-queue-item-artist">${escapeHtml(t.artist)}</div>
                </div>
            </div>`;
        }
    }

    bodyEl.innerHTML = html;

    // Bind click events
    bodyEl.querySelectorAll('.wb-queue-item[data-qi]').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.wb-queue-remove')) return;
            if (callbacks.onSkipTo) callbacks.onSkipTo(parseInt(el.dataset.qi));
        });
    });

    bodyEl.querySelectorAll('.wb-queue-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (callbacks.onRemove) callbacks.onRemove(parseInt(btn.dataset.qi));
        });
    });
}
