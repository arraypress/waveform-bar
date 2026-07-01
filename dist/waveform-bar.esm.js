// src/js/icons.js
var ICONS = {
  play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
  queue: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
  music: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" opacity="0.5"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
  collapse: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  expand: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  volHigh: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  volLow: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>',
  volMute: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  heartFilled: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
  repeatOff: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
  repeatAll: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
  repeatOne: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">1</text></svg>'
};

// src/js/utils.js
function extractTitle(url) {
  if (!url) return "Untitled";
  return url.split("/").pop().split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}
function isSafeHref(url) {
  if (typeof url !== "string" || url === "") return false;
  try {
    const u = new URL(url, location.href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function parseTrackFromElement(el) {
  const url = el.dataset.wbUrl || el.dataset.url;
  if (!url) return null;
  let meta = {};
  try {
    const parsed = JSON.parse(el.dataset.wbMeta || el.dataset.meta || "{}");
    meta = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
  }
  let markers = [];
  try {
    const parsed = JSON.parse(el.dataset.wbMarkers || el.dataset.markers || "null");
    markers = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
  }
  markers = markers.map((m) => m && typeof m === "object" ? { ...m, time: Number(m.time) } : null).filter((m) => m && Number.isFinite(m.time));
  let waveform = null;
  try {
    const parsed = JSON.parse(el.dataset.wbWaveform || el.dataset.waveform || "null");
    waveform = Array.isArray(parsed) ? parsed : null;
  } catch (e) {
  }
  return {
    url,
    id: el.dataset.wbId || el.dataset.id || url,
    title: el.dataset.wbTitle || el.dataset.title || extractTitle(url),
    artist: el.dataset.wbArtist || el.dataset.artist || "",
    artwork: el.dataset.wbArtwork || el.dataset.artwork || "",
    album: el.dataset.wbAlbum || el.dataset.album || "",
    link: el.dataset.wbLink || el.dataset.link || "",
    duration: el.dataset.wbDuration || el.dataset.duration || "",
    bpm: el.dataset.wbBpm || el.dataset.bpm || "",
    key: el.dataset.wbKey || el.dataset.key || "",
    waveform,
    markers,
    favorited: el.dataset.wbFavorited === "true",
    inCart: el.dataset.wbInCart === "true",
    meta
  };
}

// src/js/storage.js
function saveQueueState(key, state) {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
  }
}
function restoreQueueState(key) {
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
function saveVolume(key, volume, muted, volumeBeforeMute) {
  try {
    localStorage.setItem(key + "-vol", JSON.stringify({
      v: volume,
      m: muted,
      b: volumeBeforeMute
    }));
  } catch (e) {
  }
}
function restoreVolume(key) {
  try {
    const d = JSON.parse(localStorage.getItem(key + "-vol"));
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
function saveFavorites(key, favorites) {
  try {
    localStorage.setItem(key + "-favs", JSON.stringify([...favorites]));
  } catch (e) {
  }
}
function restoreFavorites(key) {
  try {
    const d = JSON.parse(localStorage.getItem(key + "-favs"));
    return Array.isArray(d) ? new Set(d) : /* @__PURE__ */ new Set();
  } catch (e) {
    return /* @__PURE__ */ new Set();
  }
}

// src/js/actions.js
function fireAction(actionConfig, payload) {
  if (!actionConfig || !actionConfig.endpoint) return;
  if (typeof actionConfig.endpoint === "function") {
    try {
      actionConfig.endpoint(payload);
    } catch (err) {
      console.warn("[WaveformBar] Action callback error:", err);
    }
    return;
  }
  if (typeof actionConfig.endpoint === "string") {
    fetch(actionConfig.endpoint, {
      method: actionConfig.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...actionConfig.headers || {}
      },
      body: JSON.stringify(payload)
    }).catch((err) => console.warn("[WaveformBar] Action request failed:", err));
  }
}

// src/js/dom.js
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
  s += "</div>";
  return s;
}
function buildTrack() {
  return `<div class="wb-track">
        <div class="wb-artwork">${ICONS.music}</div>
        <div class="wb-track-text">
            <div class="wb-title">No track selected</div>
            <div class="wb-artist">&mdash;</div>
        </div>
    </div>`;
}
function buildMeta(config) {
  return config.showMeta ? '<div class="wb-meta"></div>' : "";
}
function buildRightControls(config) {
  let s = "";
  if (config.actions) {
    s += '<div class="wb-actions">';
    if (config.actions.favorite) {
      s += `<button class="wb-btn wb-btn-sm wb-fav" aria-label="Favorite" title="Favorite">${ICONS.heart}</button>`;
    }
    if (config.actions.cart) {
      s += `<button class="wb-btn wb-btn-sm wb-cart" aria-label="Add to cart" title="Add to Cart">${ICONS.cart}</button>`;
    }
    s += "</div>";
  }
  if (config.showMute || config.showVolume) {
    s += '<div class="wb-volume">';
    s += `<button class="wb-btn wb-btn-sm wb-mute" aria-label="Volume" title="Volume">${ICONS.volHigh}</button>`;
    if (config.showVolume) {
      s += `<div class="wb-volume-popup">
                <input type="range" class="wb-volume-slider" min="0" max="100" value="100" aria-label="Volume">
            </div>`;
    }
    s += "</div>";
  }
  if (config.share) {
    s += `<button class="wb-btn wb-btn-sm wb-share" aria-label="Share" title="Copy share link">${ICONS.share}</button>`;
  }
  if (config.showQueue) {
    s += `<button class="wb-btn wb-btn-sm wb-queue-btn" aria-label="Queue" title="Queue" aria-haspopup="true" aria-expanded="false">${ICONS.queue}</button>`;
  }
  return s;
}
function buildCollapse(config) {
  return config.collapsible ? `<button class="wb-btn wb-btn-sm wb-collapse" aria-label="Collapse" title="Collapse" aria-expanded="true">${ICONS.collapse}</button>` : "";
}
function buildBarHTML(config) {
  const controls = buildControls(config);
  const track = buildTrack();
  const meta = buildMeta(config);
  const rightControls = buildRightControls(config);
  const collapse = buildCollapse(config);
  if (config.layout === "center") {
    const left2 = `<div class="wb-left">${track}${meta}</div>`;
    const centre2 = `<div class="wb-centre">${controls}<div class="wb-seek"><span class="wb-time-current">0:00</span><div class="wb-waveform-container"></div><span class="wb-time-total">0:00</span></div></div>`;
    const right2 = `<div class="wb-right">${rightControls}</div>`;
    return `<div class="wb-inner">${left2}${centre2}${right2}${collapse}</div>`;
  }
  const left = `<div class="wb-left">${controls}${track}</div>`;
  const centre = `<div class="wb-centre">
        <div class="wb-waveform-container"></div>
        <div class="wb-time"><span class="wb-time-current">0:00</span> / <span class="wb-time-total">0:00</span></div>
    </div>`;
  const right = `<div class="wb-right">${meta}${rightControls}</div>`;
  return `<div class="wb-inner">${left}${centre}${right}${collapse}</div>`;
}

// src/js/queue.js
function createQueuePanel() {
  const el = document.createElement("div");
  el.className = "wb-queue-panel";
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
function renderQueue(bodyEl, countEl, queue, currentIndex, callbacks) {
  if (!bodyEl) return;
  const upcoming = Math.max(0, queue.length - 1 - currentIndex);
  if (countEl) countEl.textContent = upcoming;
  if (queue.length === 0) {
    bodyEl.innerHTML = `<div class="wb-queue-empty">${ICONS.queue}<p>Queue is empty</p></div>`;
    return;
  }
  let html = "";
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
  bodyEl.querySelectorAll(".wb-queue-item[data-qi]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".wb-queue-remove")) return;
      if (callbacks.onSkipTo) callbacks.onSkipTo(parseInt(el.dataset.qi));
    });
  });
  bodyEl.querySelectorAll(".wb-queue-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (callbacks.onRemove) callbacks.onRemove(parseInt(btn.dataset.qi));
    });
  });
}

// src/js/core.js
var DEFAULTS = {
  persist: true,
  autoResume: true,
  continuous: true,
  repeat: "off",
  // 'off', 'all', 'one'
  shuffle: false,
  // true = random queue advance (next / auto-advance pick a random track)
  showRepeat: true,
  showShuffle: false,
  // show a shuffle toggle button in the transport cluster
  showQueue: true,
  showPrevNext: true,
  showVolume: true,
  showMute: true,
  showMeta: true,
  showTime: true,
  showTrackLink: true,
  maxMeta: 3,
  defaultArtwork: null,
  // URL to fallback artwork image
  theme: null,
  // 'dark', 'light', or null (dark by default)
  wide: false,
  // two sizes — false = default (1400px cap), true = full width. Applies to waveform mode only.
  position: "bottom",
  // 'bottom' (default) or 'top' — which edge the bar docks to
  collapsible: false,
  // show a collapse button that shrinks the bar to a floating transport pill
  // mode: 'waveform' (default layout + waveform, width-adjustable) | 'classic'
  // (Spotify-style centre layout + seekbar, full-width). NOT defaulted here —
  // its default is inferred from `waveform`/`layout` in init() so the legacy
  // options still work; see the derivation there.
  waveform: true,
  // internal seek style; classic mode forces seekbar
  errorText: null,
  // custom "audio failed to load" message (null = player default)
  share: false,
  // show a "copy share link" button (emits ?<shareParam>=<seconds>)
  shareParam: "wt",
  // URL query param for the shared timestamp (seconds)
  waveformStyle: "mirror",
  waveformHeight: 32,
  barWidth: 2,
  barSpacing: 2,
  // 2px gap between 2px bars — crisp, separated bars (0 = solid "blob")
  waveformColor: null,
  progressColor: null,
  waveformGradient: "vertical",
  markerColor: "rgba(255, 255, 255, 0.25)",
  volume: 1,
  storageKey: "waveform-bar",
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
var WaveformBar = class {
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
    this._favorites = /* @__PURE__ */ new Set();
    this._cartItems = /* @__PURE__ */ new Set();
    this._observer = null;
    this._activeMarkers = null;
    this._currentMarkerIndex = -1;
    this.repeat = "off";
    this.shuffle = false;
    this._loadSeq = 0;
    this._restoreSeekTimeout = null;
    this._externalPlayers = /* @__PURE__ */ new Map();
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
    this.config = { ...DEFAULTS, ...config };
    const v = Number(this.config.volume);
    this.volume = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;
    let mode = this.config.mode;
    if (mode !== "classic" && mode !== "waveform") {
      mode = this.config.layout === "center" || this.config.waveform === false ? "classic" : "waveform";
    }
    this.config.mode = mode;
    this.config.layout = mode === "classic" ? "center" : "default";
    this.config.waveform = mode !== "classic";
    this._shareTarget = this._readShareTarget();
    this._shareSeek = this._shareTarget && !this._shareTarget.id && !this._shareTarget.url ? this._shareTarget.time : null;
    if (typeof window.WaveformPlayer === "undefined") {
      console.error("[WaveformBar] WaveformPlayer is required.");
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
    this._seedFromAttributes();
    if (this.config.persist) {
      this._restoreState();
    }
    if (this._shareTarget && (this._shareTarget.id || this._shareTarget.url)) {
      const shared = this._resolveSharedTrack(this._shareTarget);
      if (shared) this._loadSharedTrack(shared, this._shareTarget.time);
    }
    this.isInitialized = true;
    this._beforeUnloadHandler = () => this._saveState();
    window.addEventListener("beforeunload", this._beforeUnloadHandler);
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
      this._themeMq.removeEventListener("change", this._themeMqHandler);
      this._themeMq = null;
      this._themeMqHandler = null;
    }
    if (this._docClickVolume) {
      document.removeEventListener("click", this._docClickVolume);
      this._docClickVolume = null;
    }
    if (this._docClickQueue) {
      document.removeEventListener("click", this._docClickQueue);
      this._docClickQueue = null;
    }
    if (this._docKeydownQueue) {
      document.removeEventListener("keydown", this._docKeydownQueue);
      this._docKeydownQueue = null;
    }
    if (this._docClickTriggers) {
      document.removeEventListener("click", this._docClickTriggers);
      this._docClickTriggers = null;
    }
    if (this._externalListenersBound) {
      document.removeEventListener("waveformplayer:request-play", this._onExtRequestPlay);
      document.removeEventListener("waveformplayer:request-pause", this._onExtRequestPause);
      document.removeEventListener("waveformplayer:request-seek", this._onExtRequestSeek);
      document.removeEventListener("waveformplayer:destroy", this._onExtDestroy);
      this._onExtRequestPlay = null;
      this._onExtRequestPause = null;
      this._onExtRequestSeek = null;
      this._onExtDestroy = null;
      this._externalListenersBound = false;
    }
    this._externalPlayers = /* @__PURE__ */ new Map();
    if (this._restoreSeekTimeout) {
      clearTimeout(this._restoreSeekTimeout);
      this._restoreSeekTimeout = null;
    }
    clearTimeout(this._shareFlashTimeout);
    this._shareFlashTimeout = null;
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
    if (this._beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this._beforeUnloadHandler);
      this._beforeUnloadHandler = null;
    }
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
    document.querySelectorAll(".wb-current,.wb-playing").forEach((el) => el.classList.remove("wb-current", "wb-playing"));
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
    this.barEl = document.createElement("div");
    this.barEl.className = "waveform-bar";
    const theme = this.config.theme || this._detectTheme();
    if (theme === "light") this.barEl.classList.add("wb-light");
    this._resolvedTheme = theme;
    if (this.config.mode === "waveform" && this.config.wide) {
      this.barEl.style.setProperty("--wb-max-width", "100%");
    }
    if (this.config.position === "top") this.barEl.classList.add("wb-top");
    if (this.config.layout === "center") this.barEl.classList.add("wb-layout-center");
    this.barEl.id = "waveform-bar";
    this.barEl.innerHTML = buildBarHTML(this.config);
    document.body.appendChild(this.barEl);
    this.titleEl = this.barEl.querySelector(".wb-title");
    this.artistEl = this.barEl.querySelector(".wb-artist");
    this.metaEl = this.barEl.querySelector(".wb-meta");
    this.playBtnEl = this.barEl.querySelector(".wb-play");
    this.waveformContainer = this.barEl.querySelector(".wb-waveform-container");
    this.queueBtnEl = this.barEl.querySelector(".wb-queue-btn");
    this.shareBtnEl = this.barEl.querySelector(".wb-share");
    this.muteBtnEl = this.barEl.querySelector(".wb-mute");
    this.volumeSliderEl = this.barEl.querySelector(".wb-volume-slider");
    this.favBtnEl = this.barEl.querySelector(".wb-fav");
    this.cartBtnEl = this.barEl.querySelector(".wb-cart");
    this.timeCurrentEl = this.barEl.querySelector(".wb-time-current");
    this.timeTotalEl = this.barEl.querySelector(".wb-time-total");
    this.collapseBtnEl = this.barEl.querySelector(".wb-collapse");
    this.playBtnEl.addEventListener("click", () => this.togglePlay());
    if (this.collapseBtnEl) {
      this.collapseBtnEl.addEventListener("click", () => this.toggleCollapse());
      if (this._readCollapsed()) this.collapse();
    }
    const prevBtn = this.barEl.querySelector(".wb-prev");
    const nextBtn = this.barEl.querySelector(".wb-next");
    if (prevBtn) prevBtn.addEventListener("click", () => this.previous());
    if (nextBtn) nextBtn.addEventListener("click", () => this.next());
    if (this.shareBtnEl) this.shareBtnEl.addEventListener("click", () => this._share());
    this.repeatBtnEl = this.barEl.querySelector(".wb-repeat");
    if (this.repeatBtnEl) {
      this.repeat = this.config.repeat || "off";
      this._updateRepeatButton();
      this.repeatBtnEl.addEventListener("click", () => this.cycleRepeat());
    }
    this.shuffle = !!this.config.shuffle;
    this.shuffleBtnEl = this.barEl.querySelector(".wb-shuffle");
    if (this.shuffleBtnEl) {
      this._updateShuffleButton();
      this.shuffleBtnEl.addEventListener("click", () => this.toggleShuffle());
    }
    if (this.queueBtnEl) this.queueBtnEl.addEventListener("click", () => this.toggleQueuePanel());
    this.volumePopupEl = this.barEl.querySelector(".wb-volume-popup");
    const volumeWrapper = this.barEl.querySelector(".wb-volume");
    if (this.muteBtnEl) {
      this.muteBtnEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }
    if (volumeWrapper && this.volumePopupEl) {
      let hoverTimeout;
      volumeWrapper.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimeout);
        this.openVolumePopup();
      });
      volumeWrapper.addEventListener("mouseleave", () => {
        hoverTimeout = setTimeout(() => this.closeVolumePopup(), 300);
      });
    }
    if (this.volumeSliderEl) {
      this.volumeSliderEl.addEventListener("input", (e) => {
        e.stopPropagation();
        this.setVolume(parseInt(e.target.value) / 100);
      });
    }
    this._docClickVolume = (e) => {
      if (this.volumePopupEl?.classList.contains("wb-volume-open") && !this.barEl?.querySelector(".wb-volume")?.contains(e.target)) {
        this.closeVolumePopup();
      }
    };
    document.addEventListener("click", this._docClickVolume);
    if (this.favBtnEl) this.favBtnEl.addEventListener("click", () => this.toggleFavorite());
    if (this.cartBtnEl) this.cartBtnEl.addEventListener("click", () => this.addToCart());
    if (this.config.showTrackLink) {
      this.barEl.querySelector(".wb-track").addEventListener("click", () => {
        const t = this.getCurrentTrack();
        if (t && t.link && isSafeHref(t.link)) window.location.href = t.link;
      });
    }
  }
  _createQueue() {
    if (!this.config.showQueue) return;
    this.queueEl = createQueuePanel();
    if (this._resolvedTheme === "light") this.queueEl.classList.add("wb-light");
    document.body.appendChild(this.queueEl);
    this.queueBodyEl = this.queueEl.querySelector(".wb-queue-body");
    this.queueCountEl = this.queueEl.querySelector(".wb-queue-count");
    this.queueEl.querySelector(".wb-queue-clear").addEventListener("click", () => this.clearQueue());
    this._docClickQueue = (e) => {
      if (this.queueOpen && !this.queueEl?.contains(e.target) && !this.queueBtnEl?.contains(e.target)) {
        this.closeQueuePanel();
      }
    };
    document.addEventListener("click", this._docClickQueue);
    this._docKeydownQueue = (e) => {
      if (e.key === "Escape" && this.queueOpen) {
        this.closeQueuePanel();
        this.queueBtnEl?.focus();
      }
    };
    document.addEventListener("keydown", this._docKeydownQueue);
  }
  _initPlayer() {
    const opts = {
      showControls: false,
      showInfo: false,
      // Classic mode reuses the player's own built-in 'seekbar' style —
      // a simple rounded progress bar (no waveform), with the player's
      // native click-to-seek. No custom seek-bar DOM needed.
      waveformStyle: this.config.waveform === false ? "seekbar" : this.config.waveformStyle,
      // Slim host for the classic seekbar so it doesn't inflate the bar.
      // 20px gives a comfortable drag hit-area; the visual `.wb-seek` row
      // is held to ~16px and the host overflows it a touch. The waveform
      // keeps its configured height.
      height: this.config.waveform === false ? 20 : this.config.waveformHeight,
      barWidth: this.config.barWidth,
      barSpacing: this.config.barSpacing,
      errorText: this.config.errorText,
      // null -> player uses its own default
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
        this._emit("play", { track });
        if (this.config.onPlay) this.config.onPlay(track);
      },
      onPause: () => {
        this.isPlaying = false;
        this._updatePlayButton();
        this._syncPageState();
        this._pumpExternalPlayState(false);
        this._saveState();
        const track = this.getCurrentTrack();
        this._emit("pause", { track });
        if (this.config.onPause) this.config.onPause(track);
      },
      onEnd: () => {
        this.isPlaying = false;
        this._updatePlayButton();
        this._syncPageState();
        this._pumpExternalPlayState(false);
        if (this.timeCurrentEl) this.timeCurrentEl.textContent = "0:00";
        if (this.repeat === "one") {
          if (this.player) {
            this.player.seekTo(0);
            this.player.play().catch(() => {
            });
          }
          return;
        }
        if (this.shuffle && this.config.continuous && this.queue.length > 1) {
          this.currentIndex = this._randomIndex();
          this._loadCurrentTrack();
          return;
        }
        if (this.config.continuous && this.currentIndex < this.queue.length - 1) {
          this.currentIndex++;
          this._loadCurrentTrack();
        } else if (this.repeat === "all" && this.queue.length > 0) {
          this.currentIndex = this.shuffle && this.queue.length > 1 ? this._randomIndex() : 0;
          this._loadCurrentTrack();
        }
      },
      onError: () => {
        this.isPlaying = false;
        this._updatePlayButton();
        this._syncPageState();
        this._pumpExternalPlayState(false);
        const track = this.getCurrentTrack();
        this._emit("error", { track });
        if (this.config.continuous && this.currentIndex < this.queue.length - 1) {
          this.currentIndex++;
          this._loadCurrentTrack();
        }
      },
      onTimeUpdate: (currentTime, duration) => {
        this._lastPosition = currentTime;
        if (this.timeCurrentEl) this.timeCurrentEl.textContent = formatTime(currentTime);
        if (this.timeTotalEl) this.timeTotalEl.textContent = formatTime(duration);
        this._pumpExternalProgress(currentTime, duration);
        if (!this._lastSaveTime || currentTime - this._lastSaveTime > 2) {
          this._lastSaveTime = currentTime;
          this._saveState();
        }
        if (this._activeMarkers) {
          this._checkMarkerBoundary(currentTime);
        }
      },
      onLoad: () => {
        if (this._shareSeek != null && this.player) {
          this.player.seekTo(this._shareSeek);
          this._shareSeek = null;
        }
      }
    };
    if (this.config.waveformColor) opts.waveformColor = this.config.waveformColor;
    if (this.config.progressColor) opts.progressColor = this.config.progressColor;
    if (this.config.waveformGradient) opts.waveformGradient = this.config.waveformGradient;
    this.player = new window.WaveformPlayer(this.waveformContainer, opts);
    this.player.setVolume(this.volume);
  }
  // =====================================================================
  // Triggers (private)
  // =====================================================================
  _bindTriggers() {
    if (!this._docClickTriggers) {
      this._docClickTriggers = (e) => {
        const queueEl = e.target?.closest?.("[data-wb-queue]");
        if (queueEl) {
          e.preventDefault();
          const track = parseTrackFromElement(queueEl);
          if (track) this.addToQueue(track);
          return;
        }
        const playEl = e.target?.closest?.("[data-wb-play]");
        if (playEl) {
          e.preventDefault();
          const track = parseTrackFromElement(playEl);
          if (track) this.play(track);
        }
      };
      document.addEventListener("click", this._docClickTriggers);
    }
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
        const current = this.getCurrentTrack();
        if (current && current.url === t.url) {
          e.preventDefault();
          if (this.isPlaying) this.togglePlay();
        }
      };
      this._onExtRequestSeek = (e) => {
        const t = e.detail;
        if (!t || !t.url || typeof t.percent !== "number") return;
        const current = this.getCurrentTrack();
        if (current && current.url === t.url && this.player && this.player.audio) {
          e.preventDefault();
          this.player.seekToPercent(t.percent);
        }
      };
      this._onExtDestroy = (e) => {
        const inst = e.detail && e.detail.player;
        if (!inst || !this._externalPlayers) return;
        this._externalPlayers.forEach((set) => set.delete(inst));
      };
      document.addEventListener("waveformplayer:request-play", this._onExtRequestPlay);
      document.addEventListener("waveformplayer:request-pause", this._onExtRequestPause);
      document.addEventListener("waveformplayer:request-seek", this._onExtRequestSeek);
      document.addEventListener("waveformplayer:destroy", this._onExtDestroy);
    }
    const previous = this._externalPlayers || /* @__PURE__ */ new Map();
    this._externalPlayers = /* @__PURE__ */ new Map();
    const WP = window.WaveformPlayer;
    if (!WP || !WP.instances) return;
    const newlyDiscovered = [];
    document.querySelectorAll('[data-waveform-player][data-audio-mode="external"]').forEach((el) => {
      const inst = WP.instances.get(el.id);
      if (!inst || !inst.options || !inst.options.url) return;
      const url = inst.options.url;
      if (!this._externalPlayers.has(url)) this._externalPlayers.set(url, /* @__PURE__ */ new Set());
      this._externalPlayers.get(url).add(inst);
      const wasKnown = previous.get(url) && previous.get(url).has(inst);
      if (!wasKnown) newlyDiscovered.push({ inst, url });
    });
    if (newlyDiscovered.length) {
      const current = this.getCurrentTrack();
      const currentUrl = current ? current.url : null;
      newlyDiscovered.forEach(({ inst, url }) => {
        const isCurrent = url === currentUrl;
        if (typeof inst.setPlayingState === "function") {
          inst.setPlayingState(isCurrent && this.isPlaying);
        }
        if (isCurrent && typeof inst.setProgress === "function" && this.player && this.player.audio) {
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
        if (typeof player.setPlayingState === "function") {
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
      if (typeof player.setProgress === "function") {
        player.setProgress(currentTime, duration);
      }
    });
  }
  _observeDOM() {
    if (typeof MutationObserver === "undefined") return;
    this._observer = new MutationObserver(() => {
      this._attachExternalPlayers();
      this._syncPageState();
    });
    this._observer.observe(document.body, { childList: true, subtree: true });
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
    const track = typeof trackOrUrl === "string" ? { url: trackOrUrl, id: trackOrUrl, title: extractTitle(trackOrUrl) } : trackOrUrl;
    if (!track || !track.url) return this;
    const current = this.getCurrentTrack();
    if (current && current.url === track.url) {
      this.togglePlay();
      return this;
    }
    const existing = this.queue.findIndex((t) => t.url === track.url);
    if (existing >= 0) {
      this.queue[existing] = { ...this.queue[existing], ...track };
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
    const track = typeof trackOrUrl === "string" ? { url: trackOrUrl, id: trackOrUrl, title: extractTitle(trackOrUrl) } : trackOrUrl;
    if (!track || !track.url) return this;
    if (this.queue.find((t) => t.url === track.url)) return this;
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
    } else if (this.repeat === "all" && this.queue.length > 0) {
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
    } else if (this.repeat === "all" && this.queue.length > 0) {
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
    const index = this._activeMarkers.findIndex(
      (m) => (m.label || m.title || "").toLowerCase() === label.toLowerCase()
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
    this._emit("volumechange", { volume: this.volume });
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
    this._emit("favorite", { track, favorited: !wasFav });
    if (this.config.onFavorite) this.config.onFavorite(track, !wasFav);
    if (this.config.actions?.favorite) {
      fireAction(this.config.actions.favorite, {
        action: "favorite",
        id,
        url: track.url,
        title: track.title,
        favorited: !wasFav
      });
    }
    return this;
  }
  addToCart() {
    const track = this.getCurrentTrack();
    if (!track) return this;
    const id = track.id || track.url;
    this._cartItems.add(id);
    if (this.cartBtnEl) {
      this.cartBtnEl.classList.add("wb-action-done");
      setTimeout(() => {
        if (this.cartBtnEl) this.cartBtnEl.classList.remove("wb-action-done");
      }, 1500);
    }
    this._syncCartAttributes(track.url, true);
    this._emit("cart", { track });
    if (this.config.onCart) this.config.onCart(track);
    if (this.config.actions?.cart) {
      fireAction(this.config.actions.cart, {
        action: "cart",
        id,
        url: track.url,
        title: track.title
      });
    }
    return this;
  }
  isFavorited(id) {
    if (!id) {
      const t = this.getCurrentTrack();
      id = t ? t.id || t.url : null;
    }
    return id ? this._favorites.has(id) : false;
  }
  isInCart(id) {
    if (!id) {
      const t = this.getCurrentTrack();
      id = t ? t.id || t.url : null;
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
    this._emit("queuechange", { queue: this.queue, currentIndex: this.currentIndex });
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
    this._emit("queuechange", { queue: this.queue, currentIndex: this.currentIndex });
    if (this.config.onQueueChange) this.config.onQueueChange(this.queue, this.currentIndex);
    return this;
  }
  getCurrentTrack() {
    return this.currentIndex >= 0 && this.currentIndex < this.queue.length ? this.queue[this.currentIndex] : null;
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
    this.barEl.dispatchEvent(new CustomEvent("waveformbar:" + name, {
      bubbles: true,
      detail
    }));
  }
  // =====================================================================
  // UI: Bar visibility & Queue panel
  // =====================================================================
  show() {
    if (this.barEl) this.barEl.classList.add("wb-active");
    return this;
  }
  hide() {
    if (this.barEl) this.barEl.classList.remove("wb-active");
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
    if (this.queueBtnEl) {
      const rect = this.queueBtnEl.getBoundingClientRect();
      this.queueEl.style.right = window.innerWidth - rect.right + "px";
    }
    this.queueEl.classList.add("wb-queue-open");
    if (this.queueBtnEl) {
      this.queueBtnEl.classList.add("wb-active");
      this.queueBtnEl.setAttribute("aria-expanded", "true");
    }
    this._renderQueue();
    return this;
  }
  closeQueuePanel() {
    if (!this.queueEl) return this;
    this.queueOpen = false;
    this.queueEl.classList.remove("wb-queue-open");
    if (this.queueBtnEl) {
      this.queueBtnEl.classList.remove("wb-active");
      this.queueBtnEl.setAttribute("aria-expanded", "false");
    }
    return this;
  }
  toggleVolumePopup() {
    if (this.volumePopupEl?.classList.contains("wb-volume-open")) {
      this.closeVolumePopup();
    } else {
      this.openVolumePopup();
    }
    return this;
  }
  openVolumePopup() {
    if (!this.volumePopupEl) return this;
    this.closeQueuePanel();
    this.volumePopupEl.classList.add("wb-volume-open");
    if (this.muteBtnEl) this.muteBtnEl.classList.add("wb-active");
    return this;
  }
  closeVolumePopup() {
    if (!this.volumePopupEl) return this;
    this.volumePopupEl.classList.remove("wb-volume-open");
    if (this.muteBtnEl) this.muteBtnEl.classList.remove("wb-active");
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
    const id = q.get("wid");
    const rawUrl = q.get("wu");
    if (rawTime == null && id == null && rawUrl == null) return null;
    let time = 0;
    if (rawTime != null) {
      const t = Number(rawTime);
      if (Number.isFinite(t) && t >= 0) time = t;
    }
    const url = rawUrl && isSafeHref(rawUrl) ? rawUrl : null;
    return { time, id: id || null, url, title: q.get("wtitle"), artist: q.get("wartist") };
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
    const triggers = document.querySelectorAll("[data-wb-play], [data-wb-queue]");
    if (target.id) {
      for (const el of triggers) {
        if (el.dataset.wbId === target.id || el.dataset.id === target.id) {
          const t = parseTrackFromElement(el);
          if (t) return t;
        }
      }
    }
    if (target.url) {
      for (const el of triggers) {
        if (el.dataset.wbUrl === target.url || el.dataset.url === target.url) {
          const t = parseTrackFromElement(el);
          if (t) return t;
        }
      }
      return {
        url: target.url,
        id: target.id || target.url,
        title: target.title || extractTitle(target.url),
        artist: target.artist || ""
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
    const existing = this.queue.findIndex((t) => t.url === track.url);
    if (existing >= 0) {
      this.queue[existing] = { ...this.queue[existing], ...track };
      this.currentIndex = existing;
    } else {
      this.queue.push(track);
      this.currentIndex = this.queue.length - 1;
    }
    this.show();
    this._updateTrackDisplay(track);
    this._updateFavoriteUI();
    this._updateNavButtons();
    const loadOpts = { autoplay: false };
    if (track.waveform) loadOpts.waveform = track.waveform;
    if (track.markers && track.markers.length) {
      const defaultColor = this.config.markerColor;
      loadOpts.markers = track.markers.map((m) => ({ ...m, color: m.color || defaultColor }));
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
    }).catch(() => {
    });
    this._renderQueue();
    this._syncPageState();
    this._saveState();
    this._updateNavButtons();
    this._emit("trackchange", { track, index: this.currentIndex });
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
        if (track.id && track.id !== track.url) p.set("wid", track.id);
        if (track.url) p.set("wu", track.url);
        if (track.title) p.set("wtitle", track.title);
        if (track.artist) p.set("wartist", track.artist);
      }
      link = url.toString();
    } catch (e) {
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).catch(() => {
      });
    }
    if (navigator.share) {
      navigator.share({ title: track && track.title || void 0, url: link }).catch(() => {
      });
    }
    this._flashShareCopied();
    this._emit("share", { url: link, time: seconds, track });
  }
  /**
   * Briefly flag the share button as "copied" for visual feedback.
   * @private
   */
  _flashShareCopied() {
    if (!this.shareBtnEl) return;
    this.shareBtnEl.classList.add("wb-copied");
    this.shareBtnEl.setAttribute("title", "Link copied!");
    clearTimeout(this._shareFlashTimeout);
    this._shareFlashTimeout = setTimeout(() => {
      if (this.shareBtnEl) {
        this.shareBtnEl.classList.remove("wb-copied");
        this.shareBtnEl.setAttribute("title", "Copy share link");
      }
    }, 1500);
  }
  /**
   * Collapse the bar to a small floating pill (artwork + play + expand).
   * @returns {WaveformBar}
   */
  collapse() {
    this.isCollapsed = true;
    if (this.barEl) this.barEl.classList.add("wb-collapsed");
    this._updateCollapseButton();
    this._saveCollapsed();
    this._emit("collapse", { collapsed: true });
    return this;
  }
  /**
   * Restore the bar from its collapsed pill back to the full bar.
   * @returns {WaveformBar}
   */
  expand() {
    this.isCollapsed = false;
    if (this.barEl) this.barEl.classList.remove("wb-collapsed");
    this._updateCollapseButton();
    this._saveCollapsed();
    this._emit("collapse", { collapsed: false });
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
    const label = this.isCollapsed ? "Expand" : "Collapse";
    this.collapseBtnEl.setAttribute("aria-label", label);
    this.collapseBtnEl.setAttribute("title", label);
    this.collapseBtnEl.setAttribute("aria-expanded", this.isCollapsed ? "false" : "true");
  }
  /** Persist the collapsed state (session-scoped) when persistence is on. @private */
  _saveCollapsed() {
    if (!this.config.persist) return;
    try {
      sessionStorage.setItem(this.config.storageKey + "-collapsed", this.isCollapsed ? "1" : "0");
    } catch (e) {
    }
  }
  /** Read the persisted collapsed state. @returns {boolean} @private */
  _readCollapsed() {
    if (!this.config.persist) return false;
    try {
      return sessionStorage.getItem(this.config.storageKey + "-collapsed") === "1";
    } catch (e) {
      return false;
    }
  }
  _loadCurrentTrack() {
    const track = this.getCurrentTrack();
    if (!track || !this.player) return;
    this._loadSeq++;
    if (this._restoreSeekTimeout) {
      clearTimeout(this._restoreSeekTimeout);
      this._restoreSeekTimeout = null;
    }
    this._pumpExternalPlayState(false);
    this.show();
    this._updateTrackDisplay(track);
    this._updateFavoriteUI();
    const loadOpts = { artwork: track.artwork, album: track.album };
    if (track.waveform) {
      loadOpts.waveform = track.waveform;
    }
    if (track.markers && track.markers.length) {
      const defaultColor = this.config.markerColor;
      loadOpts.markers = track.markers.map((m) => ({
        ...m,
        color: m.color || defaultColor
      }));
    } else {
      loadOpts.markers = [];
    }
    this.player.loadTrack(track.url, track.title, track.artist, loadOpts);
    this._activeMarkers = track.markers && track.markers.length ? track.markers : null;
    this._currentMarkerIndex = -1;
    if (this.player) this.player.setVolume(this.isMuted ? 0 : this.volume);
    this._renderQueue();
    this._syncPageState();
    this._saveState();
    this._updateNavButtons();
    this._emit("trackchange", { track, index: this.currentIndex });
    if (this.config.onTrackChange) this.config.onTrackChange(track, this.currentIndex);
  }
  _updateTrackDisplay(track) {
    if (this.titleEl) this._setScrollText(this.titleEl, track.title || "Untitled");
    if (this.artistEl) this._setScrollText(this.artistEl, track.artist || "");
    const artworkEl = this.barEl.querySelector(".wb-artwork");
    if (artworkEl) {
      const artworkUrl = track.artwork || this.config.defaultArtwork;
      artworkEl.innerHTML = artworkUrl ? `<img src="${escapeHtml(artworkUrl)}" alt="${escapeHtml(track.title)}" />` : ICONS.music;
    }
    if (this.metaEl && this.config.showMeta) this._renderMeta(track);
    const trackEl = this.barEl.querySelector(".wb-track");
    if (trackEl) trackEl.style.cursor = track.link ? "pointer" : "default";
    if (this.timeCurrentEl) this.timeCurrentEl.textContent = "0:00";
    if (this.timeTotalEl) this.timeTotalEl.textContent = "0:00";
  }
  /**
   * Set text on an element with auto-scroll if it overflows.
   * @private
   */
  _setScrollText(el, text) {
    el.classList.remove("wb-scrolling");
    el.textContent = text;
    requestAnimationFrame(() => {
      if (el.scrollWidth > el.clientWidth) {
        const overflow = el.scrollWidth - el.clientWidth;
        const duration = Math.max(4, overflow / 20);
        el.innerHTML = `<span class="wb-scroll-inner">${escapeHtml(text)}</span>`;
        el.style.setProperty("--wb-scroll-distance", `-${overflow + 48}px`);
        el.style.setProperty("--wb-scroll-duration", `${duration}s`);
        el.classList.add("wb-scrolling");
      }
    });
  }
  _renderMeta(track) {
    if (!this.metaEl) return;
    const tags = [];
    if (track.bpm) tags.push({ label: track.bpm + " BPM", type: "bpm" });
    if (track.key) tags.push({ label: track.key, type: "key" });
    if (track.duration) tags.push({ label: track.duration, type: "duration" });
    if (track.meta) {
      for (const [k, v] of Object.entries(track.meta)) {
        if (v && tags.length < this.config.maxMeta) tags.push({ label: String(v), type: k });
      }
    }
    const limited = tags.slice(0, this.config.maxMeta);
    this.metaEl.style.display = limited.length ? "flex" : "none";
    this.metaEl.innerHTML = limited.map(
      (t) => `<span class="wb-tag wb-tag-${escapeHtml(t.type)}">${escapeHtml(t.label)}</span>`
    ).join("");
  }
  _updatePlayButton() {
    if (!this.playBtnEl) return;
    const play = this.playBtnEl.querySelector(".wb-icon-play");
    const pause = this.playBtnEl.querySelector(".wb-icon-pause");
    if (play) play.style.display = this.isPlaying ? "none" : "block";
    if (pause) pause.style.display = this.isPlaying ? "block" : "none";
    this.playBtnEl.title = this.isPlaying ? "Pause" : "Play";
  }
  _updateNavButtons() {
    const prevBtn = this.barEl?.querySelector(".wb-prev");
    const nextBtn = this.barEl?.querySelector(".wb-next");
    if (this.repeat === "all") {
      if (prevBtn) prevBtn.classList.remove("wb-disabled");
      if (nextBtn) nextBtn.classList.remove("wb-disabled");
    } else {
      if (prevBtn) prevBtn.classList.toggle("wb-disabled", this.currentIndex <= 0);
      if (nextBtn) nextBtn.classList.toggle("wb-disabled", this.currentIndex >= this.queue.length - 1);
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
    const modes = ["off", "all", "one"];
    const current = modes.indexOf(this.repeat);
    this.repeat = modes[(current + 1) % modes.length];
    this._updateRepeatButton();
    this._updateNavButtons();
    this._emit("repeatchange", { mode: this.repeat });
    return this;
  }
  /**
   * Set repeat mode directly
   * @param {'off'|'all'|'one'} mode
   * @returns {WaveformBar}
   */
  setRepeat(mode) {
    if (["off", "all", "one"].includes(mode)) {
      this.repeat = mode;
      this._updateRepeatButton();
      this._updateNavButtons();
      this._emit("repeatchange", { mode: this.repeat });
    }
    return this;
  }
  /** @private */
  _updateRepeatButton() {
    if (!this.repeatBtnEl) return;
    const icons = { off: ICONS.repeatOff, all: ICONS.repeatAll, one: ICONS.repeatOne };
    const labels = { off: "Repeat: Off", all: "Repeat: All", one: "Repeat: One" };
    this.repeatBtnEl.innerHTML = icons[this.repeat];
    this.repeatBtnEl.title = labels[this.repeat];
    this.repeatBtnEl.classList.toggle("wb-repeat-active", this.repeat !== "off");
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
    this._emit("shufflechange", { shuffle: this.shuffle });
    if (this.config.onShuffleChange) this.config.onShuffleChange(this.shuffle);
    return this;
  }
  /** @private */
  _updateShuffleButton() {
    if (!this.shuffleBtnEl) return;
    this.shuffleBtnEl.title = this.shuffle ? "Shuffle: On" : "Shuffle: Off";
    this.shuffleBtnEl.setAttribute("aria-pressed", this.shuffle ? "true" : "false");
    this.shuffleBtnEl.classList.toggle("wb-shuffle-active", this.shuffle);
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
    let markerIndex = -1;
    for (let i = this._activeMarkers.length - 1; i >= 0; i--) {
      if (currentTime >= this._activeMarkers[i].time) {
        markerIndex = i;
        break;
      }
    }
    if (markerIndex === this._currentMarkerIndex) return;
    this._currentMarkerIndex = markerIndex;
    if (markerIndex < 0) return;
    const marker = this._activeMarkers[markerIndex];
    const track = this.getCurrentTrack();
    if (marker.title && this.titleEl) this._setScrollText(this.titleEl, marker.title);
    if (marker.artist && this.artistEl) this._setScrollText(this.artistEl, marker.artist);
    const markerEls = this.waveformContainer?.querySelectorAll(".waveform-marker");
    if (markerEls) {
      markerEls.forEach((el, i) => el.classList.toggle("wb-marker-active", i === markerIndex));
    }
    if (marker.artwork) {
      const artworkEl = this.barEl.querySelector(".wb-artwork");
      if (artworkEl) artworkEl.innerHTML = `<img src="${escapeHtml(marker.artwork)}" alt="${escapeHtml(marker.title || "")}" />`;
    }
    if (this.metaEl && (marker.bpm || marker.key)) {
      const metaTrack = {
        ...track || {},
        bpm: marker.bpm || "",
        key: marker.key || ""
      };
      this._renderMeta(metaTrack);
    }
    this._emit("markerchange", { marker, index: markerIndex, track });
  }
  _updateVolumeUI() {
    if (this.volumeSliderEl) {
      this.volumeSliderEl.value = this.isMuted ? 0 : Math.round(this.volume * 100);
    }
    if (this.muteBtnEl) {
      if (this.isMuted || this.volume === 0) {
        this.muteBtnEl.innerHTML = ICONS.volMute;
        this.muteBtnEl.classList.add("wb-muted");
        this.muteBtnEl.title = "Unmute";
      } else if (this.volume < 0.5) {
        this.muteBtnEl.innerHTML = ICONS.volLow;
        this.muteBtnEl.classList.remove("wb-muted");
        this.muteBtnEl.title = "Mute";
      } else {
        this.muteBtnEl.innerHTML = ICONS.volHigh;
        this.muteBtnEl.classList.remove("wb-muted");
        this.muteBtnEl.title = "Mute";
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
    const darkIndicators = ["dark", "dark-mode", "theme-dark"];
    const lightIndicators = ["light", "light-mode", "theme-light"];
    for (const cls of darkIndicators) {
      if (root.classList.contains(cls) || body.classList.contains(cls)) return "dark";
    }
    if (root.getAttribute("data-theme") === "dark" || body.getAttribute("data-theme") === "dark") return "dark";
    for (const cls of lightIndicators) {
      if (root.classList.contains(cls) || body.classList.contains(cls)) return "light";
    }
    if (root.getAttribute("data-theme") === "light" || body.getAttribute("data-theme") === "light") return "light";
    try {
      const bg = getComputedStyle(body).backgroundColor;
      const rgb = bg.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1e3;
        if (brightness > 128) return "light";
        if (brightness < 128) return "dark";
      }
    } catch (e) {
    }
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
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
    const light = theme === "light";
    if (this.barEl) this.barEl.classList.toggle("wb-light", light);
    if (this.queueEl) this.queueEl.classList.toggle("wb-light", light);
  }
  /**
   * Watch the document for theme changes — a class/attribute flip on
   * `<html>`/`<body>` (Tailwind `dark`, `data-theme`, `data-color-scheme`) or
   * an OS `prefers-color-scheme` change — and re-detect. Event-driven
   * (MutationObserver + matchMedia), never a timer. Torn down in destroy().
   * @private
   */
  _watchTheme() {
    if (typeof document === "undefined") return;
    const refresh = () => requestAnimationFrame(() => this._refreshTheme());
    const opts = { attributes: true, attributeFilter: ["class", "data-theme", "data-color-scheme", "style"] };
    this._themeObserver = new MutationObserver(refresh);
    this._themeObserver.observe(document.documentElement, opts);
    if (document.body) this._themeObserver.observe(document.body, opts);
    try {
      this._themeMq = window.matchMedia("(prefers-color-scheme: dark)");
      this._themeMqHandler = refresh;
      this._themeMq.addEventListener("change", this._themeMqHandler);
    } catch (e) {
    }
  }
  _updateFavoriteUI() {
    if (!this.favBtnEl) return;
    const fav = this.isFavorited();
    this.favBtnEl.innerHTML = fav ? ICONS.heartFilled : ICONS.heart;
    this.favBtnEl.classList.toggle("wb-fav-active", fav);
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
    document.querySelectorAll("[data-wb-play]").forEach((el) => {
      const url = el.dataset.wbUrl || el.dataset.url;
      const id = el.dataset.wbId || el.dataset.id || url;
      const isCurrent = url && url === currentUrl;
      el.classList.toggle("wb-current", isCurrent);
      el.classList.toggle("wb-playing", isCurrent && this.isPlaying);
      el.classList.toggle("wb-favorited", this._favorites.has(id));
      el.classList.toggle("wb-in-cart", this._cartItems.has(id));
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
    document.querySelectorAll("[data-wb-play]").forEach((el) => {
      const id = el.dataset.wbId || el.dataset.id || el.dataset.wbUrl || el.dataset.url;
      if (!id) return;
      if (el.dataset.wbFavorited === "true") {
        this._favorites.add(id);
        seededFav = true;
      }
      if (el.dataset.wbInCart === "true") {
        this._cartItems.add(id);
        seededCart = true;
      }
    });
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
    document.querySelectorAll("[data-wb-play]").forEach((el) => {
      const elUrl = el.dataset.wbUrl || el.dataset.url;
      if (elUrl === url) {
        el.dataset.wbFavorited = favorited ? "true" : "false";
        el.classList.toggle("wb-favorited", favorited);
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
    document.querySelectorAll("[data-wb-play]").forEach((el) => {
      const elUrl = el.dataset.wbUrl || el.dataset.url;
      if (elUrl === url) {
        el.dataset.wbInCart = inCart ? "true" : "false";
        el.classList.toggle("wb-in-cart", inCart);
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
    const loadOpts = { autoplay: false };
    if (track.waveform) loadOpts.waveform = track.waveform;
    if (track.markers && track.markers.length) {
      const defaultColor = this.config.markerColor;
      loadOpts.markers = track.markers.map((m) => ({
        ...m,
        color: m.color || defaultColor
      }));
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
      if (state.isPlaying && this.config.autoResume) {
        try {
          const p = this.player.play();
          if (p && typeof p.catch === "function") {
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
};

// src/js/index.js
var instance = new WaveformBar();
if (typeof window !== "undefined") {
  window.WaveformBar = instance;
}
var index_default = instance;
export {
  WaveformBar,
  index_default as default
};
/**
 * WaveformBar v1.0.0
 * Persistent bottom audio player bar for WaveformPlayer
 *
 * @author ArrayPress
 * @license MIT
 */
