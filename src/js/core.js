/**
 * @module core
 * @description Main WaveformBar class
 */

import {ICONS} from './icons.js';
import {extractTitle, escapeHtml, formatTime, parseTrackFromElement, isSafeHref} from './utils.js';
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
    shuffle: false,         // true = random queue advance (next / auto-advance pick a random track)
    showRepeat: true,
    showShuffle: false,     // show a shuffle toggle button in the transport cluster
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
    wide: false,            // two sizes — false = default (1400px cap), true = full width. Applies to waveform mode only.
    position: 'bottom',     // 'bottom' (default) or 'top' — which edge the bar docks to
    collapsible: false,     // show a collapse button that shrinks the bar to a floating transport pill
    // mode: 'waveform' (default layout + waveform, width-adjustable) | 'classic'
    // (Spotify-style centre layout + seekbar, full-width). NOT defaulted here —
    // its default is inferred from `waveform`/`layout` in init() so the legacy
    // options still work; see the derivation there.
    waveform: true,         // internal seek style; classic mode forces seekbar
    errorText: null,        // custom "audio failed to load" message (null = player default)
    // Localizable UI strings forwarded to the embedded player (null = player
    // default). seekValueText templates the seek slider's spoken aria-valuetext
    // (%1$s current, %2$s total); unknownTrackText is its Media Session title
    // fallback. playPauseLabel/speedLabel/artworkAlt are accepted for
    // completeness but govern player controls/info the bar hides.
    seekValueText: null,
    playPauseLabel: null,
    speedLabel: null,
    artworkAlt: null,
    unknownTrackText: null,
    share: false,           // show a "copy share link" button (emits ?<shareParam>=<seconds>)
    shareParam: 'wt',       // URL query param for the shared timestamp (seconds)
    waveformStyle: 'mirror',
    waveformHeight: 32,
    barWidth: 2,
    barSpacing: 2,        // 2px gap between 2px bars — crisp, separated bars (0 = solid "blob")
    waveformColor: null,
    progressColor: null,
    waveformGradient: 'vertical',
    markerColor: 'rgba(255, 255, 255, 0.25)',
    volume: 1,
    storageKey: 'waveform-bar',
    actions: null,
    onPlay: null,
    onPause: null,
    onTrackChange: null,
    onQueueChange: null,
    onVolumeChange: null,
    onShuffleChange: null,
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
        this.shuffle = false;

        // Load-race guard: bumped before every track load so async
        // continuations (loadTrack().then / restore-seek timeout) can detect
        // that a newer load superseded them and bail out.
        this._loadSeq = 0;
        this._restoreSeekTimeout = null;

        // Map<url, Set<WaveformPlayer>> of external-mode visual surfaces.
        this._externalPlayers = new Map();

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
        this.shuffleBtnEl = null;
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

        // Normalize volume from config — guard NaN / out-of-range so a bad
        // value can't mute the player or throw downstream.
        const v = Number(this.config.volume);
        this.volume = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;

        // Mode is the canonical switch: 'waveform' (default layout + waveform
        // viz) or 'classic' (Spotify-style centre layout + seekbar). It's
        // inferred from the legacy `waveform`/`layout` options when not given,
        // and in turn SETS them, so the rest of the code keeps reading
        // config.layout / config.waveform unchanged.
        let mode = this.config.mode;
        if (mode !== 'classic' && mode !== 'waveform') {
            mode = (this.config.layout === 'center' || this.config.waveform === false) ? 'classic' : 'waveform';
        }
        this.config.mode = mode;
        this.config.layout = mode === 'classic' ? 'center' : 'default';
        this.config.waveform = mode !== 'classic';

        // Shareable timestamp: parse the share link's `?<shareParam>=<seconds>`
        // (time) plus the track identity (`?wid` = id, `?wu` = url fallback,
        // `?wtitle`/`?wartist` for display). When the link names a track we
        // cold-load it below; a bare `?<shareParam>=` with no track just seeks
        // whatever loads first (applied once in the player onLoad hook).
        this._shareTarget = this._readShareTarget();
        this._shareSeek = (this._shareTarget && !this._shareTarget.id && !this._shareTarget.url)
            ? this._shareTarget.time
            : null;

        if (typeof window.WaveformPlayer === 'undefined') {
            console.error('[WaveformBar] WaveformPlayer is required.');
            return this;
        }

        this._createBar();
        this._createQueue();
        this._initPlayer();
        this._bindTriggers();
        this._observeDOM();
        this._watchTheme();

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

        // A share link that names a track (`?wid`/`?wu`) cold-loads it here —
        // AFTER restore, so the shared track wins over the visitor's own last
        // session. It loads paused at the shared timestamp (autoplay is blocked
        // on a cold page open anyway, and landing cued is the right UX).
        if (this._shareTarget && (this._shareTarget.id || this._shareTarget.url)) {
            const shared = this._resolveSharedTrack(this._shareTarget);
            if (shared) this._loadSharedTrack(shared, this._shareTarget.time);
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
        if (this._themeObserver) {
            this._themeObserver.disconnect();
            this._themeObserver = null;
        }
        if (this._themeMq && this._themeMqHandler) {
            this._themeMq.removeEventListener('change', this._themeMqHandler);
            this._themeMq = null;
            this._themeMqHandler = null;
        }
        if (this._docClickVolume) {
            document.removeEventListener('click', this._docClickVolume);
            this._docClickVolume = null;
        }
        if (this._docClickQueue) {
            document.removeEventListener('click', this._docClickQueue);
            this._docClickQueue = null;
        }
        if (this._docKeydownQueue) {
            document.removeEventListener('keydown', this._docKeydownQueue);
            this._docKeydownQueue = null;
        }
        // Single delegated trigger listener (replaces per-element binding).
        if (this._docClickTriggers) {
            document.removeEventListener('click', this._docClickTriggers);
            this._docClickTriggers = null;
        }
        // External-mode WaveformPlayer document listeners — previously
        // anonymous and never removed. Stored on `this` so they can be torn
        // down and the bind flag reset for a clean re-init.
        if (this._externalListenersBound) {
            document.removeEventListener('waveformplayer:request-play', this._onExtRequestPlay);
            document.removeEventListener('waveformplayer:request-pause', this._onExtRequestPause);
            document.removeEventListener('waveformplayer:request-seek', this._onExtRequestSeek);
            document.removeEventListener('waveformplayer:destroy', this._onExtDestroy);
            this._onExtRequestPlay = null;
            this._onExtRequestPause = null;
            this._onExtRequestSeek = null;
            this._onExtDestroy = null;
            this._externalListenersBound = false;
        }
        this._externalPlayers = new Map();

        // Cancel pending async work that could touch torn-down refs.
        if (this._restoreSeekTimeout) {
            clearTimeout(this._restoreSeekTimeout);
            this._restoreSeekTimeout = null;
        }
        clearTimeout(this._shareFlashTimeout);
        this._shareFlashTimeout = null;
        // Invalidate any in-flight load continuation.
        this._loadSeq++;

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
        if (this._barHeightObserver) {
            this._barHeightObserver.disconnect();
            this._barHeightObserver = null;
        }
        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
            this._beforeUnloadHandler = null;
        }

        // Null cached DOM refs so a stale ref can't be poked after teardown.
        this.volumePopupEl = null;
        this.queueBtnEl = null;
        this.titleEl = null;
        this.artistEl = null;
        this.metaEl = null;
        this.playBtnEl = null;
        this.repeatBtnEl = null;
        this.shuffleBtnEl = null;
        this.waveformContainer = null;
        this.queueBodyEl = null;
        this.queueCountEl = null;
        this.muteBtnEl = null;
        this.volumeSliderEl = null;
        this.favBtnEl = null;
        this.cartBtnEl = null;
        this.timeCurrentEl = null;
        this.timeTotalEl = null;

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

        // Width: two sizes — default (the stylesheet's 1400px cap) or `wide`
        // (full width). Waveform mode only; classic is always full-width.
        if (this.config.mode === 'waveform' && this.config.wide) {
            this.barEl.style.setProperty('--wb-max-width', '100%');
        }

        // Dock to the top edge instead of the bottom (flips slide direction).
        if (this.config.position === 'top') this.barEl.classList.add('wb-top');

        // Centered 3-column layout (transport centred above the seek row).
        if (this.config.layout === 'center') this.barEl.classList.add('wb-layout-center');

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
        this.shareBtnEl = this.barEl.querySelector('.wb-share');
        this.muteBtnEl = this.barEl.querySelector('.wb-mute');
        this.volumeSliderEl = this.barEl.querySelector('.wb-volume-slider');
        this.favBtnEl = this.barEl.querySelector('.wb-fav');
        this.cartBtnEl = this.barEl.querySelector('.wb-cart');
        this.timeCurrentEl = this.barEl.querySelector('.wb-time-current');
        this.timeTotalEl = this.barEl.querySelector('.wb-time-total');
        this.collapseBtnEl = this.barEl.querySelector('.wb-collapse');

        // Bind controls
        this.playBtnEl.addEventListener('click', () => this.togglePlay());

        // Collapse-to-pill toggle.
        if (this.collapseBtnEl) {
            this.collapseBtnEl.addEventListener('click', () => this.toggleCollapse());
            if (this._readCollapsed()) this.collapse();
        }

        const prevBtn = this.barEl.querySelector('.wb-prev');
        const nextBtn = this.barEl.querySelector('.wb-next');
        if (prevBtn) prevBtn.addEventListener('click', () => this.previous());
        if (nextBtn) nextBtn.addEventListener('click', () => this.next());
        if (this.shareBtnEl) this.shareBtnEl.addEventListener('click', () => this._share());

        this.repeatBtnEl = this.barEl.querySelector('.wb-repeat');
        if (this.repeatBtnEl) {
            this.repeat = this.config.repeat || 'off';
            this._updateRepeatButton();
            this.repeatBtnEl.addEventListener('click', () => this.cycleRepeat());
        }

        // Seed shuffle from config regardless of whether the toggle button is
        // shown, so `{ shuffle: true, showShuffle: false }` still randomises advance.
        this.shuffle = !!this.config.shuffle;
        this.shuffleBtnEl = this.barEl.querySelector('.wb-shuffle');
        if (this.shuffleBtnEl) {
            this._updateShuffleButton();
            this.shuffleBtnEl.addEventListener('click', () => this.toggleShuffle());
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

        // Close volume popup on outside click.
        // Stored on `this` so destroy() can remove it — otherwise every
        // re-init (init() calls destroy() first) leaks another listener.
        this._docClickVolume = (e) => {
            if (this.volumePopupEl?.classList.contains('wb-volume-open') &&
                !this.barEl?.querySelector('.wb-volume')?.contains(e.target)) {
                this.closeVolumePopup();
            }
        };
        document.addEventListener('click', this._docClickVolume);

        if (this.favBtnEl) this.favBtnEl.addEventListener('click', () => this.toggleFavorite());
        if (this.cartBtnEl) this.cartBtnEl.addEventListener('click', () => this.addToCart());

        // Track link
        if (this.config.showTrackLink) {
            this.barEl.querySelector('.wb-track').addEventListener('click', () => {
                const t = this.getCurrentTrack();
                // Guard the scheme — a `data-wb-link="javascript:…"` value
                // would otherwise execute on navigation (open-redirect / XSS).
                if (t && t.link && isSafeHref(t.link)) window.location.href = t.link;
            });
        }
    }

    _createQueue() {
        if (!this.config.showQueue) return;

        this.queueEl = createQueuePanel();
        if (this._resolvedTheme === 'light') this.queueEl.classList.add('wb-light');
        document.body.appendChild(this.queueEl);

        // Publish the bar's height as --wb-height on the queue so it can sit
        // flush on top of the bar (a full-width sheet on mobile). Re-measured on
        // any bar resize — layout change, artwork size, window resize.
        if (typeof ResizeObserver !== 'undefined' && this.barEl) {
            const syncBarHeight = () => {
                if (this.queueEl && this.barEl) this.queueEl.style.setProperty('--wb-height', this.barEl.offsetHeight + 'px');
            };
            syncBarHeight();
            this._barHeightObserver = new ResizeObserver(syncBarHeight);
            this._barHeightObserver.observe(this.barEl);
        }

        this.queueBodyEl = this.queueEl.querySelector('.wb-queue-body');
        this.queueCountEl = this.queueEl.querySelector('.wb-queue-count');

        this.queueEl.querySelector('.wb-queue-clear').addEventListener('click', () => this.clearQueue());

        // Stored on `this` so destroy() can remove it — otherwise every
        // re-init leaks another document listener.
        this._docClickQueue = (e) => {
            if (this.queueOpen && !this.queueEl?.contains(e.target) && !this.queueBtnEl?.contains(e.target)) {
                this.closeQueuePanel();
            }
        };
        document.addEventListener('click', this._docClickQueue);

        // Escape closes the queue panel and returns focus to its trigger.
        this._docKeydownQueue = (e) => {
            if (e.key === 'Escape' && this.queueOpen) {
                this.closeQueuePanel();
                this.queueBtnEl?.focus();
            }
        };
        document.addEventListener('keydown', this._docKeydownQueue);
    }

    _initPlayer() {
        const opts = {
            showControls: false,
            showInfo: false,
            // Classic mode reuses the player's own built-in 'seekbar' style —
            // a simple rounded progress bar (no waveform), with the player's
            // native click-to-seek. No custom seek-bar DOM needed.
            waveformStyle: this.config.waveform === false ? 'seekbar' : this.config.waveformStyle,
            // Slim host for the classic seekbar so it doesn't inflate the bar.
            // 20px gives a comfortable drag hit-area; the visual `.wb-seek` row
            // is held to ~16px and the host overflows it a touch. The waveform
            // keeps its configured height.
            height: this.config.waveform === false ? 20 : this.config.waveformHeight,
            barWidth: this.config.barWidth,
            barSpacing: this.config.barSpacing,
            errorText: this.config.errorText,   // null -> player uses its own default
            // Localizable UI strings — forwarded verbatim (null -> player default).
            // Only seekValueText (the bar's visible seek slider) and
            // unknownTrackText (the embedded self-mode player's Media Session
            // title fallback) have an effect here; the bar hides the player's
            // own controls/info, so playPauseLabel/speedLabel/artworkAlt are
            // passed through for completeness but govern hidden UI.
            seekValueText: this.config.seekValueText,
            playPauseLabel: this.config.playPauseLabel,
            speedLabel: this.config.speedLabel,
            artworkAlt: this.config.artworkAlt,
            unknownTrackText: this.config.unknownTrackText,
            singlePlay: false,
            // Time tooltip + draggable seek handle (the compact-transport seek
            // affordances) — on for the bar, off by default for standalone players.
            showHoverTime: true,
            seekHandle: true,
            onPlay: () => {
                this.isPlaying = true;
                this._updatePlayButton();
                this._syncPageState();
                this._pumpExternalPlayState(true);
                const track = this.getCurrentTrack();
                this._emit('play', {track});
                if (this.config.onPlay) this.config.onPlay(track);
            },
            onPause: () => {
                this.isPlaying = false;
                this._updatePlayButton();
                this._syncPageState();
                this._pumpExternalPlayState(false);
                this._saveState();
                const track = this.getCurrentTrack();
                this._emit('pause', {track});
                if (this.config.onPause) this.config.onPause(track);
            },
            onEnd: () => {
                this.isPlaying = false;
                this._updatePlayButton();
                this._syncPageState();
                this._pumpExternalPlayState(false);

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

                if (this.shuffle && this.config.continuous && this.queue.length > 1) {
                    // Shuffle: jump to a random track in the queue.
                    this.currentIndex = this._randomIndex();
                    this._loadCurrentTrack();
                    return;
                }

                if (this.config.continuous && this.currentIndex < this.queue.length - 1) {
                    // Next track
                    this.currentIndex++;
                    this._loadCurrentTrack();
                } else if (this.repeat === 'all' && this.queue.length > 0) {
                    // Loop back to start (or a random track when shuffling).
                    this.currentIndex = this.shuffle && this.queue.length > 1 ? this._randomIndex() : 0;
                    this._loadCurrentTrack();
                }
            },
            onError: () => {
                // A track failed to load/decode (bad URL, 404, codec). Without
                // this the queue dead-stops on the broken entry. Reset play
                // state, notify, and — when continuous — skip to the next
                // entry so one dead track doesn't halt the whole queue.
                this.isPlaying = false;
                this._updatePlayButton();
                this._syncPageState();
                this._pumpExternalPlayState(false);

                const track = this.getCurrentTrack();
                this._emit('error', {track});

                // Error recovery: advance strictly sequentially, regardless of
                // shuffle, and never wrap via repeat-all — a random/looping pick
                // among dead tracks risks re-selecting broken entries forever.
                if (this.config.continuous && this.currentIndex < this.queue.length - 1) {
                    this.currentIndex++;
                    this._loadCurrentTrack();
                }
            },
            onTimeUpdate: (currentTime, duration) => {
                this._lastPosition = currentTime;
                if (this.timeCurrentEl) this.timeCurrentEl.textContent = formatTime(currentTime);
                if (this.timeTotalEl) this.timeTotalEl.textContent = formatTime(duration);

                // Mirror progress into any external-mode WaveformPlayer
                // instances tracking this URL — their canvases scrub in
                // sync with the bar's audio.
                this._pumpExternalProgress(currentTime, duration);

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
            onLoad: () => {
                // Apply a shareable-timestamp seek (?<shareParam>=) once, on the
                // first track load after a fresh page open.
                if (this._shareSeek != null && this.player) {
                    this.player.seekTo(this._shareSeek);
                    this._shareSeek = null;
                }
            }
        };

        if (this.config.waveformColor) opts.waveformColor = this.config.waveformColor;
        if (this.config.progressColor) opts.progressColor = this.config.progressColor;
        if (this.config.waveformGradient) opts.waveformGradient = this.config.waveformGradient;

        // Lock-screen / Media Session skip-track buttons drive the bar's queue.
        opts.onNextTrack = () => this.next();
        opts.onPreviousTrack = () => this.previous();

        this.player = new window.WaveformPlayer(this.waveformContainer, opts);
        this.player.setVolume(this.volume);
    }

    // =====================================================================
    // Triggers (private)
    // =====================================================================

    _bindTriggers() {
        // ONE delegated document listener instead of per-element binding.
        // Per-element listeners leaked on every re-init (init() → destroy()
        // only cleared a flag, never removed the handlers), leaving each row
        // with stacked handlers that toggled each other so clicks did nothing.
        // Delegation also covers late-mounted triggers for free, so the
        // MutationObserver no longer needs to re-bind anything.
        if (!this._docClickTriggers) {
            this._docClickTriggers = (e) => {
                // Queue first — a queue trigger nested in (or alongside) a
                // play trigger must enqueue, not play. This mirrors the old
                // per-element handler's stopPropagation() semantics.
                const queueEl = e.target?.closest?.('[data-wb-queue]');
                if (queueEl) {
                    e.preventDefault();
                    const track = parseTrackFromElement(queueEl);
                    if (track) this.addToQueue(track);
                    return;
                }

                const playEl = e.target?.closest?.('[data-wb-play]');
                if (playEl) {
                    e.preventDefault();
                    const track = parseTrackFromElement(playEl);
                    if (track) this.play(track);
                }
            };
            document.addEventListener('click', this._docClickTriggers);
        }

        // External-mode WaveformPlayer instances on the page act as
        // visualization surfaces controlled by this bar — see the
        // `audioMode: 'external'` option in @arraypress/waveform-player.
        // Each instance dispatches `waveformplayer:request-play`
        // (cancelable) when its play button is clicked; we route that
        // into this bar so the audio always lives in one place.
        this._attachExternalPlayers();
    }

    /**
     * Discover external-mode WaveformPlayer instances and listen for
     * their request-play / request-pause / request-seek events. Also
     * builds a url → Set<WaveformPlayer> map used by _syncPageState()
     * and the onTimeUpdate callback to push state into the matching
     * inline visualizations.
     *
     * Idempotent — safe to call repeatedly. Late-mounted players are
     * picked up by the MutationObserver in _observeDOM().
     *
     * @private
     */
    _attachExternalPlayers() {
        // Document-level listeners only bind once. Stored on `this` so
        // destroy() can remove them (they were previously anonymous and
        // leaked across re-inits).
        if (!this._externalListenersBound) {
            this._externalListenersBound = true;

            this._onExtRequestPlay = (e) => {
                const t = e.detail;
                if (!t || !t.url) return;
                e.preventDefault();
                this.play(t);
            };

            this._onExtRequestPause = (e) => {
                const t = e.detail;
                if (!t || !t.url) return;
                // Only honour pause when this is the currently-playing
                // track — pause requests from other players are noise.
                const current = this.getCurrentTrack();
                if (current && current.url === t.url) {
                    e.preventDefault();
                    if (this.isPlaying) this.togglePlay();
                }
            };

            this._onExtRequestSeek = (e) => {
                const t = e.detail;
                if (!t || !t.url || typeof t.percent !== 'number') return;
                const current = this.getCurrentTrack();
                if (current && current.url === t.url && this.player && this.player.audio) {
                    e.preventDefault();
                    this.player.seekToPercent(t.percent);
                }
            };

            // Prune a destroyed external player from the URL → players map
            // so we don't keep pumping state into a torn-down instance.
            this._onExtDestroy = (e) => {
                const inst = e.detail && e.detail.player;
                if (!inst || !this._externalPlayers) return;
                this._externalPlayers.forEach((set) => set.delete(inst));
            };

            document.addEventListener('waveformplayer:request-play', this._onExtRequestPlay);
            document.addEventListener('waveformplayer:request-pause', this._onExtRequestPause);
            document.addEventListener('waveformplayer:request-seek', this._onExtRequestSeek);
            document.addEventListener('waveformplayer:destroy', this._onExtDestroy);
        }

        // Rebuild the URL → players map from scratch each pass — cheap
        // (single querySelectorAll + Map insert) and avoids stale entries
        // for players that have been torn down. Late-mounted players
        // come in via the MutationObserver tick.
        const previous = this._externalPlayers || new Map();
        this._externalPlayers = new Map();
        const WP = window.WaveformPlayer;
        if (!WP || !WP.instances) return;

        const newlyDiscovered = [];
        document.querySelectorAll('[data-waveform-player][data-audio-mode="external"]').forEach((el) => {
            const inst = WP.instances.get(el.id);
            if (!inst || !inst.options || !inst.options.url) return;
            const url = inst.options.url;
            if (!this._externalPlayers.has(url)) this._externalPlayers.set(url, new Set());
            this._externalPlayers.get(url).add(inst);
            // Track players that weren't in the previous map — those need
            // initial state seeded so cross-page navigation (bar already
            // playing when an inline player mounts) syncs correctly.
            const wasKnown = previous.get(url) && previous.get(url).has(inst);
            if (!wasKnown) newlyDiscovered.push({inst, url});
        });

        // Seed newly-discovered players with current bar state. Without
        // this, an inline player that mounts AFTER the bar is already
        // playing would show "paused" until the next state event fires
        // (which might never happen if the user just sits on the page).
        if (newlyDiscovered.length) {
            const current = this.getCurrentTrack();
            const currentUrl = current ? current.url : null;
            newlyDiscovered.forEach(({inst, url}) => {
                const isCurrent = url === currentUrl;
                if (typeof inst.setPlayingState === 'function') {
                    inst.setPlayingState(isCurrent && this.isPlaying);
                }
                if (isCurrent && typeof inst.setProgress === 'function' && this.player && this.player.audio) {
                    inst.setProgress(this.player.audio.currentTime || 0, this.player.audio.duration || 0);
                }
            });
        }
    }

    /**
     * Push playing-state into every external-mode player whose URL
     * matches the currently playing track. Other URLs get set to
     * false (paused) — covers the case where the bar switched tracks
     * and the previously-current external player should stop showing
     * its play indicator.
     *
     * @private
     * @param {boolean} playing
     */
    _pumpExternalPlayState(playing) {
        if (!this._externalPlayers || this._externalPlayers.size === 0) return;
        const current = this.getCurrentTrack();
        const currentUrl = current ? current.url : null;
        this._externalPlayers.forEach((set, url) => {
            const isCurrent = url === currentUrl;
            set.forEach((player) => {
                if (typeof player.setPlayingState === 'function') {
                    player.setPlayingState(isCurrent && playing);
                }
            });
        });
    }

    /**
     * Push progress (currentTime + duration) into the external-mode
     * player(s) tracking the current URL. Called on every timeupdate
     * tick of the internal player.
     *
     * @private
     * @param {number} currentTime
     * @param {number} duration
     */
    _pumpExternalProgress(currentTime, duration) {
        if (!this._externalPlayers || this._externalPlayers.size === 0) return;
        const current = this.getCurrentTrack();
        if (!current) return;
        const set = this._externalPlayers.get(current.url);
        if (!set) return;
        set.forEach((player) => {
            if (typeof player.setProgress === 'function') {
                player.setProgress(currentTime, duration);
            }
        });
    }

    _observeDOM() {
        if (typeof MutationObserver === 'undefined') return;
        // Triggers are handled by the single delegated listener, so the
        // observer only needs to (re)discover late-mounted external-mode
        // players and re-sync page state.
        // TODO(harden): debounce this callback.
        this._observer = new MutationObserver(() => {
            this._attachExternalPlayers();
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
        if (this.shuffle && this.queue.length > 1) {
            this.currentIndex = this._randomIndex();
            this._loadCurrentTrack();
            return this;
        }
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
            // Persist the muted flag — the unmute branch routes through
            // setVolume() (which saves), so mute must save too.
            saveVolume(this.config.storageKey, this.volume, this.isMuted, this._volumeBeforeMute);
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
            setTimeout(() => {
                if (this.cartBtnEl) this.cartBtnEl.classList.remove('wb-action-done');
            }, 1500);
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
        if (this.queueBtnEl) {
            this.queueBtnEl.classList.add('wb-active');
            this.queueBtnEl.setAttribute('aria-expanded', 'true');
        }
        this._renderQueue();
        return this;
    }

    closeQueuePanel() {
        if (!this.queueEl) return this;
        this.queueOpen = false;
        this.queueEl.classList.remove('wb-queue-open');
        if (this.queueBtnEl) {
            this.queueBtnEl.classList.remove('wb-active');
            this.queueBtnEl.setAttribute('aria-expanded', 'false');
        }
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

    /**
     * Parse a share link from the URL: the timestamp (`?<shareParam>=`, seconds)
     * plus the track identity needed to load it cold — `?wid` (id, preferred),
     * `?wu` (url, the works-anywhere fallback), and `?wtitle`/`?wartist` for
     * display before metadata arrives. Returns null when no share params are
     * present. An unsafe `?wu` (javascript:/data: etc.) is dropped, not loaded.
     * @returns {{time:number, id:string|null, url:string|null, title:string|null, artist:string|null}|null}
     * @private
     */
    _readShareTarget() {
        let q;
        try {
            q = new URLSearchParams(window.location.search);
        } catch (e) {
            return null;
        }
        const rawTime = q.get(this.config.shareParam);
        const id = q.get('wid');
        const rawUrl = q.get('wu');
        if (rawTime == null && id == null && rawUrl == null) return null;

        let time = 0;
        if (rawTime != null) {
            const t = Number(rawTime);
            if (Number.isFinite(t) && t >= 0) time = t;
        }
        // Only honour an embedded url that's a safe http(s)/relative target —
        // the value is attacker-controllable, so never let it be javascript:.
        const url = (rawUrl && isSafeHref(rawUrl)) ? rawUrl : null;

        return {time, id: id || null, url, title: q.get('wtitle'), artist: q.get('wartist')};
    }

    /**
     * Resolve a share target to a loadable track. Prefers an on-page trigger
     * (matched by `data-wb-id`, then by url) so the cold load inherits the
     * page's pre-generated peaks, markers, and favorite/cart state; falls back
     * to a minimal track built from the embedded url + title/artist so the link
     * still works on a page that doesn't contain the track.
     * @param {{id:string|null, url:string|null, title:string|null, artist:string|null}} target
     * @returns {Object|null}
     * @private
     */
    _resolveSharedTrack(target) {
        const triggers = document.querySelectorAll('[data-wb-play], [data-wb-queue]');

        // 1. By id (clean, short links). Skips when no id was shared.
        if (target.id) {
            for (const el of triggers) {
                if (el.dataset.wbId === target.id || el.dataset.id === target.id) {
                    const t = parseTrackFromElement(el);
                    if (t) return t;
                }
            }
        }

        // 2. By url — match an on-page trigger to inherit its peaks/state...
        if (target.url) {
            for (const el of triggers) {
                if (el.dataset.wbUrl === target.url || el.dataset.url === target.url) {
                    const t = parseTrackFromElement(el);
                    if (t) return t;
                }
            }
            // 3. ...else build a minimal track straight from the link (cross-page).
            return {
                url: target.url,
                id: target.id || target.url,
                title: target.title || extractTitle(target.url),
                artist: target.artist || ''
            };
        }

        return null;
    }

    /**
     * Cold-load a share-target track at a timestamp, paused. Mirrors the
     * restore path (loadTrack with autoplay:false + a `_loadSeq`-guarded,
     * delayed seek) so a later user action cleanly supersedes it.
     * @param {Object} track
     * @param {number} time - seconds to seek to once loaded
     * @private
     */
    _loadSharedTrack(track, time) {
        if (!track || !track.url || !this.player) return;

        // Make it the current queue entry (dedup by url, like play()).
        const existing = this.queue.findIndex(t => t.url === track.url);
        if (existing >= 0) {
            this.queue[existing] = {...this.queue[existing], ...track};
            this.currentIndex = existing;
        } else {
            this.queue.push(track);
            this.currentIndex = this.queue.length - 1;
        }

        this.show();
        this._updateTrackDisplay(track);
        this._updateFavoriteUI();
        this._updateNavButtons();

        const loadOpts = {autoplay: false};
        if (track.waveform) loadOpts.waveform = track.waveform;
        if (track.markers && track.markers.length) {
            const defaultColor = this.config.markerColor;
            loadOpts.markers = track.markers.map(m => ({...m, color: m.color || defaultColor}));
            this._activeMarkers = track.markers;
        } else {
            loadOpts.markers = [];
            this._activeMarkers = null;
        }
        this._currentMarkerIndex = -1;

        const seq = ++this._loadSeq;
        if (this._restoreSeekTimeout) {
            clearTimeout(this._restoreSeekTimeout);
            this._restoreSeekTimeout = null;
        }

        this.player.loadTrack(track.url, track.title, track.artist, loadOpts).then(() => {
            if (this._loadSeq !== seq) return;
            if (this.player) this.player.setVolume(this.isMuted ? 0 : this.volume);
            // Seek slightly after load — the audio element needs to be ready
            // for the seek to stick (same 100ms guard the restore path uses).
            if (time > 0) {
                this._restoreSeekTimeout = setTimeout(() => {
                    this._restoreSeekTimeout = null;
                    if (this._loadSeq !== seq) return;
                    if (this.player) {
                        this.player.seekTo(time);
                        this._lastPosition = time;
                    }
                }, 100);
            }
        }).catch(() => {});

        this._renderQueue();
        this._syncPageState();
        this._saveState();
        this._updateNavButtons();
        this._emit('trackchange', {track, index: this.currentIndex});
        if (this.config.onTrackChange) this.config.onTrackChange(track, this.currentIndex);
    }

    /**
     * Copy a shareable link to the current track at the current position, use
     * the native share sheet when available, and emit `waveformbar:share`. The
     * link carries both the timestamp AND the track identity so a cold open
     * loads the right audio: `?<shareParam>=<seconds>` plus `wid` (id, when the
     * track has a real one), `wu` (url — the works-anywhere fallback), and
     * `wtitle`/`wartist` for display before metadata loads.
     * @private
     */
    _share() {
        const track = this.getCurrentTrack();
        const cur = this.player && this.player.audio ? this.player.audio.currentTime : 0;
        const seconds = Math.max(0, Math.floor(cur || 0));
        let link;
        try {
            const url = new URL(window.location.href);
            const p = url.searchParams;
            p.set(this.config.shareParam, String(seconds));
            if (track) {
                // id falls back to url internally, so only emit wid when it's a
                // real, distinct identifier (clean per-track-page links).
                if (track.id && track.id !== track.url) p.set('wid', track.id);
                if (track.url) p.set('wu', track.url);
                if (track.title) p.set('wtitle', track.title);
                if (track.artist) p.set('wartist', track.artist);
            }
            link = url.toString();
        } catch (e) {
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).catch(() => {});
        }
        if (navigator.share) {
            navigator.share({title: (track && track.title) || undefined, url: link}).catch(() => {});
        }
        this._flashShareCopied();
        this._emit('share', {url: link, time: seconds, track});
    }

    /**
     * Briefly flag the share button as "copied" for visual feedback.
     * @private
     */
    _flashShareCopied() {
        if (!this.shareBtnEl) return;
        this.shareBtnEl.classList.add('wb-copied');
        this.shareBtnEl.setAttribute('title', 'Link copied!');
        clearTimeout(this._shareFlashTimeout);
        this._shareFlashTimeout = setTimeout(() => {
            if (this.shareBtnEl) {
                this.shareBtnEl.classList.remove('wb-copied');
                this.shareBtnEl.setAttribute('title', 'Copy share link');
            }
        }, 1500);
    }

    /**
     * Collapse the bar to a small floating pill (artwork + play + expand).
     * @returns {WaveformBar}
     */
    collapse() {
        this.isCollapsed = true;
        if (this.barEl) this.barEl.classList.add('wb-collapsed');
        this._updateCollapseButton();
        this._saveCollapsed();
        this._emit('collapse', {collapsed: true});
        return this;
    }

    /**
     * Restore the bar from its collapsed pill back to the full bar.
     * @returns {WaveformBar}
     */
    expand() {
        this.isCollapsed = false;
        if (this.barEl) this.barEl.classList.remove('wb-collapsed');
        this._updateCollapseButton();
        this._saveCollapsed();
        this._emit('collapse', {collapsed: false});
        return this;
    }

    /**
     * Toggle the collapsed pill state.
     * @returns {WaveformBar}
     */
    toggleCollapse() {
        return this.isCollapsed ? this.expand() : this.collapse();
    }

    /**
     * Swap the collapse button's icon + labels for the current state.
     * @private
     */
    _updateCollapseButton() {
        if (!this.collapseBtnEl) return;
        this.collapseBtnEl.innerHTML = this.isCollapsed ? ICONS.expand : ICONS.collapse;
        const label = this.isCollapsed ? 'Expand' : 'Collapse';
        this.collapseBtnEl.setAttribute('aria-label', label);
        this.collapseBtnEl.setAttribute('title', label);
        this.collapseBtnEl.setAttribute('aria-expanded', this.isCollapsed ? 'false' : 'true');
    }

    /** Persist the collapsed state (session-scoped) when persistence is on. @private */
    _saveCollapsed() {
        if (!this.config.persist) return;
        try {
            sessionStorage.setItem(this.config.storageKey + '-collapsed', this.isCollapsed ? '1' : '0');
        } catch (e) {}
    }

    /** Read the persisted collapsed state. @returns {boolean} @private */
    _readCollapsed() {
        if (!this.config.persist) return false;
        try {
            return sessionStorage.getItem(this.config.storageKey + '-collapsed') === '1';
        } catch (e) {
            return false;
        }
    }

    _loadCurrentTrack() {
        const track = this.getCurrentTrack();
        if (!track || !this.player) return;

        // Bump the load token and cancel any pending restore-seek so a
        // stale async continuation (from a prior load) can't apply to this
        // newer track under rapid switching.
        this._loadSeq++;
        if (this._restoreSeekTimeout) {
            clearTimeout(this._restoreSeekTimeout);
            this._restoreSeekTimeout = null;
        }

        // Reset any previously-current external player so its UI flips
        // back to "paused" while the new track loads. The new track's
        // onPlay callback will set the matching external to playing
        // once playback actually starts.
        this._pumpExternalPlayState(false);

        this.show();
        this._updateTrackDisplay(track);
        this._updateFavoriteUI();

        const loadOpts = {artwork: track.artwork, album: track.album};

        // Pass pre-existing waveform data if available
        if (track.waveform) {
            loadOpts.waveform = track.waveform;
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
     * Toggle shuffle (random queue advance) on / off.
     * @returns {WaveformBar}
     */
    toggleShuffle() {
        return this.setShuffle(!this.shuffle);
    }

    /**
     * Set shuffle on / off directly.
     * @param {boolean} on
     * @returns {WaveformBar}
     */
    setShuffle(on) {
        this.shuffle = !!on;
        this._updateShuffleButton();
        this._emit('shufflechange', {shuffle: this.shuffle});
        if (this.config.onShuffleChange) this.config.onShuffleChange(this.shuffle);
        return this;
    }

    /** @private */
    _updateShuffleButton() {
        if (!this.shuffleBtnEl) return;
        this.shuffleBtnEl.title = this.shuffle ? 'Shuffle: On' : 'Shuffle: Off';
        this.shuffleBtnEl.setAttribute('aria-pressed', this.shuffle ? 'true' : 'false');
        this.shuffleBtnEl.classList.toggle('wb-shuffle-active', this.shuffle);
    }

    /**
     * Pick a random queue index other than the current one (for shuffle).
     * @returns {number}
     * @private
     */
    _randomIndex() {
        if (this.queue.length <= 1) return this.currentIndex;
        let i = this.currentIndex;
        while (i === this.currentIndex) {
            i = Math.floor(Math.random() * this.queue.length);
        }
        return i;
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
            if (artworkEl) artworkEl.innerHTML = `<img src="${escapeHtml(marker.artwork)}" alt="${escapeHtml(marker.title || '')}" />`;
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

    /**
     * Re-detect the page theme and toggle the bar's `wb-light` class (on the bar
     * and the queue panel) to match, so the bar adapts to a runtime light/dark
     * switch — not just the theme present when it was first shown. No-op when
     * `config.theme` is set explicitly.
     * @private
     */
    _refreshTheme() {
        if (this.config && this.config.theme) return;
        const theme = this._detectTheme();
        if (theme === this._resolvedTheme) return;
        this._resolvedTheme = theme;
        const light = theme === 'light';
        if (this.barEl) this.barEl.classList.toggle('wb-light', light);
        if (this.queueEl) this.queueEl.classList.toggle('wb-light', light);
    }

    /**
     * Watch the document for theme changes — a class/attribute flip on
     * `<html>`/`<body>` (Tailwind `dark`, `data-theme`, `data-color-scheme`) or
     * an OS `prefers-color-scheme` change — and re-detect. Event-driven
     * (MutationObserver + matchMedia), never a timer. Torn down in destroy().
     * @private
     */
    _watchTheme() {
        if (typeof document === 'undefined') return;
        const refresh = () => requestAnimationFrame(() => this._refreshTheme());
        const opts = {attributes: true, attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'style']};
        this._themeObserver = new MutationObserver(refresh);
        this._themeObserver.observe(document.documentElement, opts);
        if (document.body) this._themeObserver.observe(document.body, opts);
        try {
            this._themeMq = window.matchMedia('(prefers-color-scheme: dark)');
            this._themeMqHandler = refresh;
            this._themeMq.addEventListener('change', this._themeMqHandler);
        } catch (e) { /* no matchMedia */ }
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

        // Use the public loadTrack() API with { autoplay: false } (core
        // v1.8.0+) instead of poking player.options.* + load(). This avoids
        // loadTrack's forced auto-play while still routing through the
        // supported API — we handle seek and resume manually below.
        const loadOpts = {autoplay: false};
        if (track.waveform) loadOpts.waveform = track.waveform;

        // Pass markers to the player and set up DJ mode
        if (track.markers && track.markers.length) {
            const defaultColor = this.config.markerColor;
            loadOpts.markers = track.markers.map(m => ({
                ...m,
                color: m.color || defaultColor
            }));
            this._activeMarkers = track.markers;
        } else {
            loadOpts.markers = [];
            this._activeMarkers = null;
        }
        this._currentMarkerIndex = -1;

        // Capture the load token so the async continuation below bails out if
        // a newer load (user clicked another track, or destroy()) supersedes
        // this restore before its promise / seek-timeout fires.
        const seq = ++this._loadSeq;
        if (this._restoreSeekTimeout) {
            clearTimeout(this._restoreSeekTimeout);
            this._restoreSeekTimeout = null;
        }

        this.player.loadTrack(track.url, track.title, track.artist, loadOpts).then(() => {
            if (this._loadSeq !== seq) return;
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
                this._restoreSeekTimeout = setTimeout(() => {
                    this._restoreSeekTimeout = null;
                    if (this._loadSeq !== seq) return;
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
        // Normalize persisted volume — a corrupted store could otherwise
        // carry NaN / out-of-range and mute or break the player.
        const v = Number(data.volume);
        this.volume = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;
        this.isMuted = data.muted;
        this._volumeBeforeMute = data.volumeBeforeMute;
        if (this.player) this.player.setVolume(this.isMuted ? 0 : this.volume);
        this._updateVolumeUI();
    }

    _restoreFavorites() {
        this._favorites = restoreFavorites(this.config.storageKey);
    }

}