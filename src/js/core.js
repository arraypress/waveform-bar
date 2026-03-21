/**
 * @module core
 * @description Main WaveformBar class
 */

import {ICONS} from './icons.js';
import {extractTitle, escapeHtml, formatTime, parseTrackFromElement} from './utils.js';
import {
    saveQueueState,
    restoreQueueState,
    saveVolume,
    restoreVolume,
    saveFavorites,
    restoreFavorites
} from './storage.js';
import {fireAction} from './actions.js';
import {buildBarHTML} from './dom.js';
import {createQueuePanel, renderQueue} from './queue.js';

/**
 * Default configuration
 */
const DEFAULTS = {
    persist: true,
    autoResume: true,
    continuous: true,
    repeat: 'off',          // 'off', 'all', 'one'
    showRepeat: true,
    showQueue: true,
    showPrevNext: true,
    showVolume: true,
    showMute: true,
    showMeta: true,
    showTime: true,
    showTrackLink: true,
    maxMeta: 3,
    defaultArtwork: null,   // URL to fallback artwork image
    theme: null,            // 'dark', 'light', or null (dark by default)
    waveformStyle: 'mirror',
    waveformHeight: 32,
    barWidth: 2,
    barSpacing: 0,
    waveformColor: null,
    progressColor: null,
    markerColor: 'rgba(255, 255, 255, 0.25)',
    configPath: null,       // Directory for auto-resolved config JSON files (e.g. 'waveforms/')
    volume: 1,
    storageKey: 'waveform-bar',
    actions: null,
    onPlay: null,
    onPause: null,
    onTrackChange: null,
    onQueueChange: null,
    onVolumeChange: null,
    onFavorite: null,
    onCart: null
};

export class WaveformBar {
    constructor() {
        this.config = null;
        this.player = null;
        this.queue = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        this.isInitialized = false;
        this.queueOpen = false;
        this.volume = 1;
        this.isMuted = false;
        this._volumeBeforeMute = 1;
        this._lastPosition = 0;
        this._favorites = new Set();
        this._cartItems = new Set();
        this._observer = null;
        this._activeMarkers = null;
        this._currentMarkerIndex = -1;
        this.repeat = 'off'; // 'off', 'all', 'one'

        // DOM refs
        this.barEl = null;
        this.queueEl = null;
        this.waveformContainer = null;
        this.volumePopupEl = null;
        this.titleEl = null;
        this.artistEl = null;
        this.metaEl = null;
        this.playBtnEl = null;
        this.repeatBtnEl = null;
        this.queueBtnEl = null;
        this.queueBodyEl = null;
        this.queueCountEl = null;
        this.volumeSliderEl = null;
        this.muteBtnEl = null;
        this.favBtnEl = null;
        this.cartBtnEl = null;
        this.timeCurrentEl = null;
        this.timeTotalEl = null;
    }

    // =====================================================================
    // Init / Destroy
    // =====================================================================

    /**
     * Initialize WaveformBar
     * @param {Object} [config={}]
     * @returns {WaveformBar}
     */
    init(config = {}) {
        if (this.isInitialized) this.destroy();

        this.config = {...DEFAULTS, ...config};
        this.volume = this.config.volume;

        if (typeof window.WaveformPlayer === 'undefined') {
            console.error('WaveformBar: WaveformPlayer is required.');
            return this;
        }

        this._createBar();
        this._createQueue();
        this._initPlayer();
        this._bindTriggers();
        this._observeDOM();

        if (this.config.persist) {
            this._restoreVolume();
            this._restoreFavorites();
        }

        // Seed favorites/cart from data attributes on page elements
        // This is authoritative — overrides localStorage if present
        this._seedFromAttributes();

        if (this.config.persist) {
            this._restoreState();
        }

        this.isInitialized = true;

        // Save exact position when navigating away
        this._beforeUnloadHandler = () => this._saveState();
        window.addEventListener('beforeunload', this._beforeUnloadHandler);

        return this;
    }

    /**
     * Destroy everything
     * @returns {WaveformBar}
     */
    destroy() {
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        if (this.barEl) {
            this.barEl.remove();
            this.barEl = null;
        }
        if (this.queueEl) {
            this.queueEl.remove();
            this.queueEl = null;
        }
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
            this._beforeUnloadHandler = null;
        }

        document.querySelectorAll('[data-wb-play],[data-wb-queue]').forEach(el => delete el._wbBound);
        document.querySelectorAll('.wb-current,.wb-playing').forEach(el => el.classList.remove('wb-current', 'wb-playing'));

        this.queue = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        this.queueOpen = false;
        this.isInitialized = false;
        this.config = null;
        return this;
    }

    // =====================================================================
    // DOM Setup (private)
    // =====================================================================

    _createBar() {
        this.barEl = document.createElement('div');
        this.barEl.className = 'waveform-bar';

        // Theme: explicit or auto-detect
        const theme = this.config.theme || this._detectTheme();
        if (theme === 'light') this.barEl.classList.add('wb-light');
        this._resolvedTheme = theme;

        this.barEl.id = 'waveform-bar';
        this.barEl.innerHTML = buildBarHTML(this.config);
        document.body.appendChild(this.barEl);

        // Cache refs
        this.titleEl = this.barEl.querySelector('.wb-title');
        this.artistEl = this.barEl.querySelector('.wb-artist');
        this.metaEl = this.barEl.querySelector('.wb-meta');
        this.playBtnEl = this.barEl.querySelector('.wb-play');
        this.waveformContainer = this.barEl.querySelector('.wb-waveform-container');
        this.queueBtnEl = this.barEl.querySelector('.wb-queue-btn');
        this.muteBtnEl = this.barEl.querySelector('.wb-mute');
        this.volumeSliderEl = this.barEl.querySelector('.wb-volume-slider');
        this.favBtnEl = this.barEl.querySelector('.wb-fav');
        this.cartBtnEl = this.barEl.querySelector('.wb-cart');
        this.timeCurrentEl = this.barEl.querySelector('.wb-time-current');
        this.timeTotalEl = this.barEl.querySelector('.wb-time-total');

        // Bind controls
        this.playBtnEl.addEventListener('click', () => this.togglePlay());

        const prevBtn = this.barEl.querySelector('.wb-prev');
        const nextBtn = this.barEl.querySelector('.wb-next');
        if (prevBtn) prevBtn.addEventListener('click', () => this.previous());
        if (nextBtn) nextBtn.addEventListener('click', () => this.next());

        this.repeatBtnEl = this.barEl.querySelector('.wb-repeat');
        if (this.repeatBtnEl) {
            this.repeat = this.config.repeat || 'off';
            this._updateRepeatButton();
            this.repeatBtnEl.addEventListener('click', () => this.cycleRepeat());
        }

        if (this.queueBtnEl) this.queueBtnEl.addEventListener('click', () => this.toggleQueuePanel());

        // Volume: click mutes, hover shows popup
        this.volumePopupEl = this.barEl.querySelector('.wb-volume-popup');
        const volumeWrapper = this.barEl.querySelector('.wb-volume');

        if (this.muteBtnEl) {
            this.muteBtnEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }

        if (volumeWrapper && this.volumePopupEl) {
            let hoverTimeout;
            volumeWrapper.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
                this.openVolumePopup();
            });
            volumeWrapper.addEventListener('mouseleave', () => {
                hoverTimeout = setTimeout(() => this.closeVolumePopup(), 300);
            });
        }

        if (this.volumeSliderEl) {
            this.volumeSliderEl.addEventListener('input', (e) => {
                e.stopPropagation();
                this.setVolume(parseInt(e.target.value) / 100);
            });
        }

        // Close volume popup on outside click
        document.addEventListener('click', (e) => {
            if (this.volumePopupEl?.classList.contains('wb-volume-open') &&
                !this.barEl.querySelector('.wb-volume')?.contains(e.target)) {
                this.closeVolumePopup();
            }
        });

        if (this.favBtnEl) this.favBtnEl.addEventListener('click', () => this.toggleFavorite());
        if (this.cartBtnEl) this.cartBtnEl.addEventListener('click', () => this.addToCart());

        // Track link
        if (this.config.showTrackLink) {
            this.barEl.querySelector('.wb-track').addEventListener('click', () => {
                const t = this.getCurrentTrack();
                if (t && t.link) window.location.href = t.link;
            });
        }
    }

    _createQueue() {
        if (!this.config.showQueue) return;

        this.queueEl = createQueuePanel();
        if (this._resolvedTheme === 'light') this.queueEl.classList.add('wb-light');
        document.body.appendChild(this.queueEl);

        this.queueBodyEl = this.queueEl.querySelector('.wb-queue-body');
        this.queueCountEl = this.queueEl.querySelector('.wb-queue-count');

        this.queueEl.querySelector('.wb-queue-clear').addEventListener('click', () => this.clearQueue());

        document.addEventListener('click', (e) => {
            if (this.queueOpen && !this.queueEl.contains(e.target) && !this.queueBtnEl.contains(e.target)) {
                this.closeQueuePanel();
            }
        });
    }

    _initPlayer() {
        const opts = {
            showControls: false,
            showInfo: false,
            waveformStyle: this.config.waveformStyle,
            height: this.config.waveformHeight,
            barWidth: this.config.barWidth,
            barSpacing: this.config.barSpacing,
            singlePlay: false,
            onPlay: () => {
                this.isPlaying = true;
                this._updatePlayButton();
                this._syncPageState();
                const track = this.getCurrentTrack();
                this._emit('play', {track});
                if (this.config.onPlay) this.config.onPlay(track);
            },
            onPause: () => {
                this.isPlaying = false;
                this._updatePlayButton();
                this._syncPageState();
                this._saveState();
                const track = this.getCurrentTrack();
                this._emit('pause', {track});
                if (this.config.onPause) this.config.onPause(track);
            },
            onEnd: () => {
                this.isPlaying = false;
                this._updatePlayButton();
                this._syncPageState();

                // Reset time display
                if (this.timeCurrentEl) this.timeCurrentEl.textContent = '0:00';

                // Handle repeat modes
                if (this.repeat === 'one') {
                    // Repeat current track
                    if (this.player) {
                        this.player.seekTo(0);
                        this.player.play().catch(() => {
                        });
                    }
                    return;
                }

                if (this.config.continuous && this.currentIndex < this.queue.length - 1) {
                    // Next track
                    this.currentIndex++;
                    this._loadCurrentTrack();
                } else if (this.repeat === 'all' && this.queue.length > 0) {
                    // Loop back to start
                    this.currentIndex = 0;
                    this._loadCurrentTrack();
                }
            },
            onTimeUpdate: (currentTime, duration) => {
                this._lastPosition = currentTime;
                if (this.timeCurrentEl) this.timeCurrentEl.textContent = formatTime(currentTime);
                if (this.timeTotalEl) this.timeTotalEl.textContent = formatTime(duration);

                // Save state periodically during playback
                if (!this._lastSaveTime || currentTime - this._lastSaveTime > 2) {
                    this._lastSaveTime = currentTime;
                    this._saveState();
                }

                // DJ mode: update title/artist when crossing marker boundaries
                if (this._activeMarkers) {
                    this._checkMarkerBoundary(currentTime);
                }
            },
            onLoad: null
        };

        if (this.config.waveformColor) opts.waveformColor = this.config.waveformColor;
        if (this.config.progressColor) opts.progressColor = this.config.progressColor;

        this.player = new window.WaveformPlayer(this.waveformContainer, opts);
        this.player.setVolume(this.volume);
    }

    // =====================================================================
    // Triggers (private)
    // =====================================================================

    _bindTriggers() {
        document.querySelectorAll('[data-wb-play]').forEach(el => {
            if (el._wbBound) return;
            el._wbBound = true;
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const track = parseTrackFromElement(el);
                if (track) this.play(track);
            });
        });

        document.querySelectorAll('[data-wb-queue]').forEach(el => {
            if (el._wbBound) return;
            el._wbBound = true;
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const track = parseTrackFromElement(el);
                if (track) this.addToQueue(track);
            });
        });
    }

    _observeDOM() {
        if (typeof MutationObserver === 'undefined') return;
        this._observer = new MutationObserver(() => {
            this._bindTriggers();
            this._syncPageState();
        });
        this._observer.observe(document.body, {childList: true, subtree: true});
    }

    // =====================================================================
    // Playback (public)
    // =====================================================================

    /**
     * Play a track immediately
     * @param {Object|string} trackOrUrl
     * @returns {WaveformBar}
     */
    play(trackOrUrl) {
        const track = typeof trackOrUrl === 'string'
            ? {url: trackOrUrl, id: trackOrUrl, title: extractTitle(trackOrUrl)}
            : trackOrUrl;

        if (!track || !track.url) return this;

        const current = this.getCurrentTrack();
        if (current && current.url === track.url) {
            this.togglePlay();
            return this;
        }

        const existing = this.queue.findIndex(t => t.url === track.url);
        if (existing >= 0) {
            // Merge new track data into existing queue entry
            // so markers, waveform, and other properties get updated
            this.queue[existing] = {...this.queue[existing], ...track};
            this.currentIndex = existing;
        } else {
            const insertAt = this.currentIndex + 1;
            this.queue.splice(insertAt, 0, track);
            this.currentIndex = insertAt;
        }

        this._loadCurrentTrack();
        return this;
    }

    /**
     * Add to end of queue
     * @param {Object|string} trackOrUrl
     * @returns {WaveformBar}
     */
    addToQueue(trackOrUrl) {
        const track = typeof trackOrUrl === 'string'
            ? {url: trackOrUrl, id: trackOrUrl, title: extractTitle(trackOrUrl)}
            : trackOrUrl;

        if (!track || !track.url) return this;
        if (this.queue.find(t => t.url === track.url)) return this;

        this.queue.push(track);
        this._renderQueue();
        this._saveState();
        this._updateNavButtons();

        if (this.currentIndex === -1) {
            this.currentIndex = 0;
            this._loadCurrentTrack();
        }

        if (this.config.onQueueChange) this.config.onQueueChange(this.queue, this.currentIndex);
        return this;
    }

    togglePlay() {
        if (!this.player) return this;
        this.isPlaying ? this.player.pause() : this.player.play();
        return this;
    }

    pause() {
        if (this.player && this.isPlaying) this.player.pause();
        return this;
    }

    next() {
        if (this.currentIndex < this.queue.length - 1) {
            this.currentIndex++;
            this._loadCurrentTrack();
        } else if (this.repeat === 'all' && this.queue.length > 0) {
            this.currentIndex = 0;
            this._loadCurrentTrack();
        }
        return this;
    }

    previous() {
        if (this.player && this.player.audio && this.player.audio.currentTime > 3) {
            this.player.seekTo(0);
            return this;
        }
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this._loadCurrentTrack();
        } else if (this.repeat === 'all' && this.queue.length > 0) {
            this.currentIndex = this.queue.length - 1;
            this._loadCurrentTrack();
        }
        return this;
    }

    skipTo(index) {
        if (index < 0 || index >= this.queue.length) return this;
        if (index === this.currentIndex) {
            this.togglePlay();
            return this;
        }
        this.currentIndex = index;
        this._loadCurrentTrack();
        return this;
    }

    /**
     * Seek to a specific marker by index on the current track
     * @param {number} markerIndex
     * @returns {WaveformBar}
     */
    seekToMarker(markerIndex) {
        if (!this._activeMarkers || markerIndex < 0 || markerIndex >= this._activeMarkers.length) return this;
        const marker = this._activeMarkers[markerIndex];
        if (this.player) {
            this.player.seekTo(marker.time);
            if (!this.isPlaying) this.togglePlay();
        }
        return this;
    }

    /**
     * Seek to a marker by label on the current track
     * @param {string} label
     * @returns {WaveformBar}
     */
    seekToMarkerByLabel(label) {
        if (!this._activeMarkers) return this;
        const index = this._activeMarkers.findIndex(m =>
            (m.label || m.title || '').toLowerCase() === label.toLowerCase()
        );
        if (index >= 0) this.seekToMarker(index);
        return this;
    }

    // =====================================================================
    // Volume (public)
    // =====================================================================

    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        this.isMuted = this.volume === 0;
        if (this.player) this.player.setVolume(this.volume);
        this._updateVolumeUI();
        saveVolume(this.config.storageKey, this.volume, this.isMuted, this._volumeBeforeMute);
        this._emit('volumechange', {volume: this.volume});
        if (this.config.onVolumeChange) this.config.onVolumeChange(this.volume);
        return this;
    }

    getVolume() {
        return this.volume;
    }

    toggleMute() {
        if (this.isMuted) {
            this.setVolume(this._volumeBeforeMute || 1);
        } else {
            this._volumeBeforeMute = this.volume;
            this.isMuted = true;
            if (this.player) this.player.setVolume(0);
            this._updateVolumeUI();
        }
        return this;
    }

    // =====================================================================
    // Actions (public)
    // =====================================================================

    toggleFavorite() {
        const track = this.getCurrentTrack();
        if (!track) return this;

        const id = track.id || track.url;
        const wasFav = this._favorites.has(id);

        if (wasFav) {
            this._favorites.delete(id);
        } else {
            this._favorites.add(id);
        }

        this._updateFavoriteUI();
        this._syncFavoriteAttributes(track.url, !wasFav);
        saveFavorites(this.config.storageKey, this._favorites);

        this._emit('favorite', {track, favorited: !wasFav});
        if (this.config.onFavorite) this.config.onFavorite(track, !wasFav);

        if (this.config.actions?.favorite) {
            fireAction(this.config.actions.favorite, {
                action: 'favorite', id, url: track.url, title: track.title, favorited: !wasFav
            });
        }

        return this;
    }

    addToCart() {
        const track = this.getCurrentTrack();
        if (!track) return this;

        const id = track.id || track.url;
        this._cartItems.add(id);

        // Visual feedback on bar button
        if (this.cartBtnEl) {
            this.cartBtnEl.classList.add('wb-action-done');
            setTimeout(() => this.cartBtnEl.classList.remove('wb-action-done'), 1500);
        }

        // Sync data attribute back to page triggers
        this._syncCartAttributes(track.url, true);

        this._emit('cart', {track});
        if (this.config.onCart) this.config.onCart(track);

        if (this.config.actions?.cart) {
            fireAction(this.config.actions.cart, {
                action: 'cart', id, url: track.url, title: track.title
            });
        }

        return this;
    }

    isFavorited(id) {
        if (!id) {
            const t = this.getCurrentTrack();
            id = t ? (t.id || t.url) : null;
        }
        return id ? this._favorites.has(id) : false;
    }

    isInCart(id) {
        if (!id) {
            const t = this.getCurrentTrack();
            id = t ? (t.id || t.url) : null;
        }
        return id ? this._cartItems.has(id) : false;
    }

    // =====================================================================
    // Queue (public)
    // =====================================================================

    removeFromQueue(index) {
        if (index < 0 || index >= this.queue.length || index === this.currentIndex) return this;
        this.queue.splice(index, 1);
        if (index < this.currentIndex) this.currentIndex--;
        this._renderQueue();
        this._saveState();
        this._updateNavButtons();
        this._emit('queuechange', {queue: this.queue, currentIndex: this.currentIndex});
        if (this.config.onQueueChange) this.config.onQueueChange(this.queue, this.currentIndex);
        return this;
    }

    clearQueue() {
        const current = this.getCurrentTrack();
        this.queue = current ? [current] : [];
        this.currentIndex = current ? 0 : -1;
        this._renderQueue();
        this._saveState();
        this._updateNavButtons();
        this._emit('queuechange', {queue: this.queue, currentIndex: this.currentIndex});
        if (this.config.onQueueChange) this.config.onQueueChange(this.queue, this.currentIndex);
        return this;
    }

    getCurrentTrack() {
        return (this.currentIndex >= 0 && this.currentIndex < this.queue.length) ? this.queue[this.currentIndex] : null;
    }

    getQueue() {
        return [...this.queue];
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    isCurrentlyPlaying(url) {
        const c = this.getCurrentTrack();
        return this.isPlaying && c && c.url === url;
    }

    isCurrentTrack(url) {
        const c = this.getCurrentTrack();
        return c && c.url === url;
    }

    getPlayer() {
        return this.player;
    }

    // =====================================================================
    // Events
    // =====================================================================

    /**
     * Dispatch a custom DOM event on the bar element.
     * All events bubble and are prefixed with 'waveformbar:'.
     *
     * Events dispatched:
     * - waveformbar:play        { track }
     * - waveformbar:pause       { track }
     * - waveformbar:trackchange { track, index }
     * - waveformbar:markerchange { marker, index, track }
     * - waveformbar:favorite    { track, favorited }
     * - waveformbar:cart        { track }
     * - waveformbar:queuechange { queue, currentIndex }
     * - waveformbar:volumechange { volume }
     *
     * @private
     * @param {string} name - Event name (without prefix)
     * @param {Object} detail - Event detail data
     */
    _emit(name, detail = {}) {
        if (!this.barEl) return;
        this.barEl.dispatchEvent(new CustomEvent('waveformbar:' + name, {
            bubbles: true,
            detail
        }));
    }

    // =====================================================================
    // UI: Bar visibility & Queue panel
    // =====================================================================

    show() {
        if (this.barEl) this.barEl.classList.add('wb-active');
        return this;
    }

    hide() {
        if (this.barEl) this.barEl.classList.remove('wb-active');
        this.closeQueuePanel();
        this.closeVolumePopup();
        return this;
    }

    toggleQueuePanel() {
        return this.queueOpen ? this.closeQueuePanel() : this.openQueuePanel();
    }

    openQueuePanel() {
        if (!this.queueEl) return this;
        this.queueOpen = true;
        this.closeVolumePopup();

        // Position above the queue button
        if (this.queueBtnEl) {
            const rect = this.queueBtnEl.getBoundingClientRect();
            this.queueEl.style.right = (window.innerWidth - rect.right) + 'px';
        }

        this.queueEl.classList.add('wb-queue-open');
        if (this.queueBtnEl) this.queueBtnEl.classList.add('wb-active');
        this._renderQueue();
        return this;
    }

    closeQueuePanel() {
        if (!this.queueEl) return this;
        this.queueOpen = false;
        this.queueEl.classList.remove('wb-queue-open');
        if (this.queueBtnEl) this.queueBtnEl.classList.remove('wb-active');
        return this;
    }

    toggleVolumePopup() {
        if (this.volumePopupEl?.classList.contains('wb-volume-open')) {
            this.closeVolumePopup();
        } else {
            this.openVolumePopup();
        }
        return this;
    }

    openVolumePopup() {
        if (!this.volumePopupEl) return this;
        this.closeQueuePanel();
        this.volumePopupEl.classList.add('wb-volume-open');
        if (this.muteBtnEl) this.muteBtnEl.classList.add('wb-active');
        return this;
    }

    closeVolumePopup() {
        if (!this.volumePopupEl) return this;
        this.volumePopupEl.classList.remove('wb-volume-open');
        if (this.muteBtnEl) this.muteBtnEl.classList.remove('wb-active');
        return this;
    }

    // =====================================================================
    // Internal: Loading & Display
    // =====================================================================

    _loadCurrentTrack() {
        const track = this.getCurrentTrack();
        if (!track || !this.player) return;

        this.show();
        this._updateTrackDisplay(track);
        this._updateFavoriteUI();

        const loadOpts = {artwork: track.artwork, album: track.album};

        // Pass pre-existing waveform data if available
        if (track.waveform) {
            loadOpts.waveform = track.waveform;
        }

        // Auto-resolve config JSON from configPath
        if (this.config.configPath && track.url) {
            const audioFile = track.url.split('/').pop().split('?')[0];
            const jsonFile = audioFile.replace(/\.[^.]+$/, '.json');
            const path = this.config.configPath.replace(/\/?$/, '/');
            loadOpts.config = path + jsonFile;
        }

        // Always pass markers — empty array clears previous track's markers
        if (track.markers && track.markers.length) {
            const defaultColor = this.config.markerColor;
            loadOpts.markers = track.markers.map(m => ({
                ...m,
                color: m.color || defaultColor
            }));
        } else {
            loadOpts.markers = [];
        }
        this.player.loadTrack(track.url, track.title, track.artist, loadOpts);

        // Store markers for DJ mode (dynamic title/artist updates)
        this._activeMarkers = track.markers && track.markers.length ? track.markers : null;
        this._currentMarkerIndex = -1;

        if (this.player) this.player.setVolume(this.isMuted ? 0 : this.volume);

        this._renderQueue();
        this._syncPageState();
        this._saveState();
        this._updateNavButtons();

        this._emit('trackchange', {track, index: this.currentIndex});
        if (this.config.onTrackChange) this.config.onTrackChange(track, this.currentIndex);
    }

    _updateTrackDisplay(track) {
        if (this.titleEl) this._setScrollText(this.titleEl, track.title || 'Untitled');
        if (this.artistEl) this._setScrollText(this.artistEl, track.artist || '');

        const artworkEl = this.barEl.querySelector('.wb-artwork');
        if (artworkEl) {
            const artworkUrl = track.artwork || this.config.defaultArtwork;
            artworkEl.innerHTML = artworkUrl
                ? `<img src="${escapeHtml(artworkUrl)}" alt="${escapeHtml(track.title)}" />`
                : ICONS.music;
        }

        if (this.metaEl && this.config.showMeta) this._renderMeta(track);

        const trackEl = this.barEl.querySelector('.wb-track');
        if (trackEl) trackEl.style.cursor = track.link ? 'pointer' : 'default';

        // Reset time
        if (this.timeCurrentEl) this.timeCurrentEl.textContent = '0:00';
        if (this.timeTotalEl) this.timeTotalEl.textContent = '0:00';
    }

    /**
     * Set text on an element with auto-scroll if it overflows.
     * @private
     */
    _setScrollText(el, text) {
        el.classList.remove('wb-scrolling');
        el.textContent = text;

        // Check overflow after text is set
        requestAnimationFrame(() => {
            if (el.scrollWidth > el.clientWidth) {
                const overflow = el.scrollWidth - el.clientWidth;
                const duration = Math.max(4, overflow / 20); // ~20px/sec
                el.innerHTML = `<span class="wb-scroll-inner">${escapeHtml(text)}</span>`;
                el.style.setProperty('--wb-scroll-distance', `-${overflow + 48}px`);
                el.style.setProperty('--wb-scroll-duration', `${duration}s`);
                el.classList.add('wb-scrolling');
            }
        });
    }

    _renderMeta(track) {
        if (!this.metaEl) return;
        const tags = [];
        if (track.bpm) tags.push({label: track.bpm + ' BPM', type: 'bpm'});
        if (track.key) tags.push({label: track.key, type: 'key'});
        if (track.duration) tags.push({label: track.duration, type: 'duration'});
        if (track.meta) {
            for (const [k, v] of Object.entries(track.meta)) {
                if (v && tags.length < this.config.maxMeta) tags.push({label: String(v), type: k});
            }
        }
        const limited = tags.slice(0, this.config.maxMeta);
        this.metaEl.style.display = limited.length ? 'flex' : 'none';
        this.metaEl.innerHTML = limited.map(t =>
            `<span class="wb-tag wb-tag-${escapeHtml(t.type)}">${escapeHtml(t.label)}</span>`
        ).join('');
    }

    _updatePlayButton() {
        if (!this.playBtnEl) return;
        const play = this.playBtnEl.querySelector('.wb-icon-play');
        const pause = this.playBtnEl.querySelector('.wb-icon-pause');
        if (play) play.style.display = this.isPlaying ? 'none' : 'block';
        if (pause) pause.style.display = this.isPlaying ? 'block' : 'none';
        this.playBtnEl.title = this.isPlaying ? 'Pause' : 'Play';
    }

    _updateNavButtons() {
        const prevBtn = this.barEl?.querySelector('.wb-prev');
        const nextBtn = this.barEl?.querySelector('.wb-next');
        if (this.repeat === 'all') {
            // When repeat-all, nav is always available (wraps around)
            if (prevBtn) prevBtn.classList.remove('wb-disabled');
            if (nextBtn) nextBtn.classList.remove('wb-disabled');
        } else {
            if (prevBtn) prevBtn.classList.toggle('wb-disabled', this.currentIndex <= 0);
            if (nextBtn) nextBtn.classList.toggle('wb-disabled', this.currentIndex >= this.queue.length - 1);
        }
    }

    // =====================================================================
    // Repeat
    // =====================================================================

    /**
     * Cycle through repeat modes: off → all → one → off
     * @returns {WaveformBar}
     */
    cycleRepeat() {
        const modes = ['off', 'all', 'one'];
        const current = modes.indexOf(this.repeat);
        this.repeat = modes[(current + 1) % modes.length];
        this._updateRepeatButton();
        this._updateNavButtons();
        this._emit('repeatchange', {mode: this.repeat});
        return this;
    }

    /**
     * Set repeat mode directly
     * @param {'off'|'all'|'one'} mode
     * @returns {WaveformBar}
     */
    setRepeat(mode) {
        if (['off', 'all', 'one'].includes(mode)) {
            this.repeat = mode;
            this._updateRepeatButton();
            this._updateNavButtons();
            this._emit('repeatchange', {mode: this.repeat});
        }
        return this;
    }

    /** @private */
    _updateRepeatButton() {
        if (!this.repeatBtnEl) return;
        const icons = {off: ICONS.repeatOff, all: ICONS.repeatAll, one: ICONS.repeatOne};
        const labels = {off: 'Repeat: Off', all: 'Repeat: All', one: 'Repeat: One'};
        this.repeatBtnEl.innerHTML = icons[this.repeat];
        this.repeatBtnEl.title = labels[this.repeat];
        this.repeatBtnEl.classList.toggle('wb-repeat-active', this.repeat !== 'off');
    }

    /**
     * DJ mode: check if playback has crossed a marker boundary
     * and update the bar's title/artist/artwork/meta display.
     * Markers should be sorted by time and can include:
     * { time, label, title, artist, artwork, bpm, key }
     * @private
     */
    _checkMarkerBoundary(currentTime) {
        if (!this._activeMarkers) return;

        // Find the active marker (last marker whose time <= currentTime)
        let markerIndex = -1;
        for (let i = this._activeMarkers.length - 1; i >= 0; i--) {
            if (currentTime >= this._activeMarkers[i].time) {
                markerIndex = i;
                break;
            }
        }

        // Only update if we've moved to a different marker
        if (markerIndex === this._currentMarkerIndex) return;
        this._currentMarkerIndex = markerIndex;

        if (markerIndex < 0) return;

        const marker = this._activeMarkers[markerIndex];
        const track = this.getCurrentTrack();

        // Update title/artist if the marker provides them
        if (marker.title && this.titleEl) this._setScrollText(this.titleEl, marker.title);
        if (marker.artist && this.artistEl) this._setScrollText(this.artistEl, marker.artist);

        // Highlight the active marker on the waveform
        const markerEls = this.waveformContainer?.querySelectorAll('.waveform-marker');
        if (markerEls) {
            markerEls.forEach((el, i) => el.classList.toggle('wb-marker-active', i === markerIndex));
        }

        // Update artwork if provided
        if (marker.artwork) {
            const artworkEl = this.barEl.querySelector('.wb-artwork');
            if (artworkEl) artworkEl.innerHTML = `<img src="${marker.artwork}" alt="${marker.title || ''}" />`;
        }

        // Update meta tags if bpm/key provided
        if (this.metaEl && (marker.bpm || marker.key)) {
            const metaTrack = {
                ...(track || {}),
                bpm: marker.bpm || '',
                key: marker.key || ''
            };
            this._renderMeta(metaTrack);
        }

        this._emit('markerchange', {marker, index: markerIndex, track});
    }

    _updateVolumeUI() {
        if (this.volumeSliderEl) {
            this.volumeSliderEl.value = this.isMuted ? 0 : Math.round(this.volume * 100);
        }
        if (this.muteBtnEl) {
            if (this.isMuted || this.volume === 0) {
                this.muteBtnEl.innerHTML = ICONS.volMute;
                this.muteBtnEl.classList.add('wb-muted');
                this.muteBtnEl.title = 'Unmute';
            } else if (this.volume < 0.5) {
                this.muteBtnEl.innerHTML = ICONS.volLow;
                this.muteBtnEl.classList.remove('wb-muted');
                this.muteBtnEl.title = 'Mute';
            } else {
                this.muteBtnEl.innerHTML = ICONS.volHigh;
                this.muteBtnEl.classList.remove('wb-muted');
                this.muteBtnEl.title = 'Mute';
            }
        }
    }

    /**
     * Auto-detect light/dark theme from the page.
     * Checks: 1) HTML/body classes, 2) background brightness, 3) system preference
     * @private
     * @returns {'dark'|'light'}
     */
    _detectTheme() {
        const root = document.documentElement;
        const body = document.body;

        // 1. Explicit theme classes/attributes
        const darkIndicators = ['dark', 'dark-mode', 'theme-dark'];
        const lightIndicators = ['light', 'light-mode', 'theme-light'];

        for (const cls of darkIndicators) {
            if (root.classList.contains(cls) || body.classList.contains(cls)) return 'dark';
        }
        if (root.getAttribute('data-theme') === 'dark' || body.getAttribute('data-theme') === 'dark') return 'dark';

        for (const cls of lightIndicators) {
            if (root.classList.contains(cls) || body.classList.contains(cls)) return 'light';
        }
        if (root.getAttribute('data-theme') === 'light' || body.getAttribute('data-theme') === 'light') return 'light';

        // 2. Background brightness
        try {
            const bg = getComputedStyle(body).backgroundColor;
            const rgb = bg.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
                if (brightness > 128) return 'light';
                if (brightness < 128) return 'dark';
            }
        } catch (e) {
        }

        // 3. System preference
        if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';

        return 'dark';
    }

    _updateFavoriteUI() {
        if (!this.favBtnEl) return;
        const fav = this.isFavorited();
        this.favBtnEl.innerHTML = fav ? ICONS.heartFilled : ICONS.heart;
        this.favBtnEl.classList.toggle('wb-fav-active', fav);
    }

    _renderQueue() {
        renderQueue(this.queueBodyEl, this.queueCountEl, this.queue, this.currentIndex, {
            onSkipTo: (i) => this.skipTo(i),
            onRemove: (i) => this.removeFromQueue(i)
        });
    }

    // =====================================================================
    // Page State Sync
    // =====================================================================

    /**
     * Sync all state classes and attributes back to page trigger elements.
     *
     * Classes applied:
     * - .wb-current — track is current (playing or paused)
     * - .wb-playing — track is actively playing
     * - .wb-favorited — track is in favorites
     * - .wb-in-cart — track has been added to cart
     * @private
     */
    _syncPageState() {
        const current = this.getCurrentTrack();
        const currentUrl = current ? current.url : null;

        document.querySelectorAll('[data-wb-play]').forEach(el => {
            const url = el.dataset.wbUrl || el.dataset.url;
            const id = el.dataset.wbId || el.dataset.id || url;
            const isCurrent = url && url === currentUrl;

            // Play state
            el.classList.toggle('wb-current', isCurrent);
            el.classList.toggle('wb-playing', isCurrent && this.isPlaying);

            // Favorite state
            el.classList.toggle('wb-favorited', this._favorites.has(id));

            // Cart state
            el.classList.toggle('wb-in-cart', this._cartItems.has(id));
        });
    }

    /**
     * Seed favorites and cart state from data attributes on page elements.
     * This is the authoritative source — server renders the initial state,
     * and we read it on init. Overrides localStorage.
     * @private
     */
    _seedFromAttributes() {
        let seededFav = false;
        let seededCart = false;

        document.querySelectorAll('[data-wb-play]').forEach(el => {
            const id = el.dataset.wbId || el.dataset.id || el.dataset.wbUrl || el.dataset.url;
            if (!id) return;

            // Seed favorites from data-wb-favorited="true"
            if (el.dataset.wbFavorited === 'true') {
                this._favorites.add(id);
                seededFav = true;
            }

            // Seed cart from data-wb-in-cart="true"
            if (el.dataset.wbInCart === 'true') {
                this._cartItems.add(id);
                seededCart = true;
            }
        });

        // If we seeded from attributes, save to storage so it persists
        if (seededFav) {
            saveFavorites(this.config.storageKey, this._favorites);
        }
    }

    /**
     * Sync favorite state back to trigger element data attributes
     * @private
     * @param {string} url - Track URL to match
     * @param {boolean} favorited - New state
     */
    _syncFavoriteAttributes(url, favorited) {
        document.querySelectorAll('[data-wb-play]').forEach(el => {
            const elUrl = el.dataset.wbUrl || el.dataset.url;
            if (elUrl === url) {
                el.dataset.wbFavorited = favorited ? 'true' : 'false';
                el.classList.toggle('wb-favorited', favorited);
            }
        });
    }

    /**
     * Sync cart state back to trigger element data attributes
     * @private
     * @param {string} url - Track URL to match
     * @param {boolean} inCart - New state
     */
    _syncCartAttributes(url, inCart) {
        document.querySelectorAll('[data-wb-play]').forEach(el => {
            const elUrl = el.dataset.wbUrl || el.dataset.url;
            if (elUrl === url) {
                el.dataset.wbInCart = inCart ? 'true' : 'false';
                el.classList.toggle('wb-in-cart', inCart);
            }
        });
    }

    // =====================================================================
    // Persistence
    // =====================================================================

    _saveState() {
        if (!this.config.persist) return;
        saveQueueState(this.config.storageKey, {
            queue: this.queue,
            currentIndex: this.currentIndex,
            position: this._lastPosition || 0,
            isPlaying: this.isPlaying
        });
    }

    _restoreState() {
        if (!this.config.persist) return;
        const state = restoreQueueState(this.config.storageKey);
        if (!state) return;

        this.queue = state.queue;
        this.currentIndex = state.currentIndex;

        const track = this.getCurrentTrack();
        if (!track) return;

        this.show();
        this._updateTrackDisplay(track);
        this._updateFavoriteUI();
        this._updateNavButtons();

        // Use load() instead of loadTrack() to avoid auto-play.
        // We handle seek and play manually after the audio is ready.
        if (track.waveform) {
            this.player.options.waveform = track.waveform;
        }

        // Auto-resolve config JSON from configPath
        if (this.config.configPath && track.url) {
            const audioFile = track.url.split('/').pop().split('?')[0];
            const jsonFile = audioFile.replace(/\.[^.]+$/, '.json');
            const path = this.config.configPath.replace(/\/?$/, '/');
            this.player.options.config = path + jsonFile;
        }

        this.player.options.title = track.title || '';
        this.player.options.subtitle = track.artist || '';

        // Pass markers to the player and set up DJ mode
        if (track.markers && track.markers.length) {
            const defaultColor = this.config.markerColor;
            this.player.options.markers = track.markers.map(m => ({
                ...m,
                color: m.color || defaultColor
            }));
            this._activeMarkers = track.markers;
        } else {
            this.player.options.markers = [];
            this._activeMarkers = null;
        }
        this._currentMarkerIndex = -1;

        this.player.load(track.url).then(() => {
            if (this.player) this.player.setVolume(this.isMuted ? 0 : this.volume);

            if (state.isPlaying && this.config.autoResume) {
                try {
                    const p = this.player.play();
                    if (p && typeof p.catch === 'function') {
                        p.catch(() => {
                            this.isPlaying = false;
                            this._updatePlayButton();
                            this._syncPageState();
                        });
                    }
                } catch (e) {
                    this.isPlaying = false;
                    this._updatePlayButton();
                    this._syncPageState();
                }
            }

            // Seek after play — the audio element needs to be in a playing
            // or ready state for seek to stick reliably
            if (state.position > 0) {
                setTimeout(() => {
                    if (this.player) {
                        this.player.seekTo(state.position);
                        this._lastPosition = state.position;
                    }
                }, 100);
            }
        }).catch(() => {
        });

        this._renderQueue();
        this._syncPageState();
    }

    _restoreVolume() {
        const data = restoreVolume(this.config.storageKey);
        if (!data) return;
        this.volume = data.volume;
        this.isMuted = data.muted;
        this._volumeBeforeMute = data.volumeBeforeMute;
        if (this.player) this.player.setVolume(this.isMuted ? 0 : this.volume);
        this._updateVolumeUI();
    }

    _restoreFavorites() {
        this._favorites = restoreFavorites(this.config.storageKey);
    }
}