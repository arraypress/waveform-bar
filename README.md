# WaveformBar

A persistent bottom audio player bar for websites. Built
on [WaveformPlayer](https://github.com/arraypress/waveform-player), it provides site-wide playback with queue
management, volume control, favorites, cart integration, DJ mode with markers, repeat modes, session persistence, and
page state syncing.

Think Spotify's bottom player — but lightweight, zero-config, and works on any site.

**[Live Demo](https://waveformplayer.com/bar)** | *
*[NPM Package](https://www.npmjs.com/package/@arraypress/waveform-bar)**

![Version](https://img.shields.io/npm/v/@arraypress/waveform-bar)
![License](https://img.shields.io/npm/l/@arraypress/waveform-bar)

## Features

- 🎵 **Persistent Player** — Fixed bottom bar that stays while users browse
- 📋 **Queue Management** — Add, remove, skip, replay, clear. Now Playing/Up Next/Previously Played sections
- 🔊 **Volume Control** — Popup vertical slider + mute toggle, persisted in localStorage
- 🔁 **Repeat Modes** — Off, repeat all (loops queue), repeat one (loops current track)
- 🏷️ **Metadata Tags** — Display BPM, key, or custom data inline
- ❤️ **Favorites** — Toggle favorites with server-side seeding via `data-wb-favorited`
- 🛒 **Cart Integration** — Add to cart with REST callbacks and DOM events
- 🎧 **DJ Mode** — Markers with title/artist fields that update the bar as a mix plays
- 📍 **Marker Navigation** — Seek to markers by index or label via JavaScript API
- 💾 **Session Persistence** — Queue, position, and playback state survive page navigations
- 🔗 **Product Links** — Click track info to navigate to a product page
- 🔄 **Page State Sync** — Trigger elements get CSS classes reflecting play state
- 🎛️ **Data Attribute API** — Just add `data-wb-play` to any element
- 🎨 **Helper CSS** — Icon swaps, equalizer bars, card highlights, favorite/cart visibility
- 🖼️ **Default Artwork** — Configurable fallback artwork when tracks have no cover image
- 📜 **Auto-Scroll Text** — Long titles/artists bounce-scroll smoothly
- 🌗 **Theme Support** — Dark/light via CSS custom properties
- 📱 **Responsive** — Stacked layout on mobile, full-width queue panel
- 🪶 **Lightweight** — ~6KB gzipped (JS + CSS)

## Installation

### CDN

```html
<!-- WaveformPlayer (required dependency) -->
<link rel="stylesheet" href="https://unpkg.com/@arraypress/waveform-player@latest/dist/waveform-player.css">
<script src="https://unpkg.com/@arraypress/waveform-player@latest/dist/waveform-player.js"></script>

<!-- WaveformBar -->
<link rel="stylesheet" href="https://unpkg.com/@arraypress/waveform-bar@latest/dist/waveform-bar.css">
<script src="https://unpkg.com/@arraypress/waveform-bar@latest/dist/waveform-bar.js"></script>

<!-- Optional: Page icons (play/pause overlays, hearts, carts, etc.) -->
<link rel="stylesheet" href="https://unpkg.com/@arraypress/waveform-bar@latest/dist/waveform-bar-icons.css">
```

### NPM

```bash
npm install @arraypress/waveform-player @arraypress/waveform-bar
```

## Quick Start

```html
<!-- 1. A play button — that's all you need -->
<button data-wb-play
        data-url="song.mp3"
        data-title="My Song"
        data-artist="Artist Name">
    ▶ Play
</button>

<!-- 2. Initialize -->
<script>
    WaveformBar.init();
</script>
```

Click the button → the bar slides up from the bottom → music plays. Add more buttons anywhere on the page and they all
share the same player bar.

## Data Attributes

### Play Trigger (`data-wb-play`)

Add to any HTML element to make it play a track when clicked.

```html
<!-- Simple button -->
<button data-wb-play
        data-url="audio/track.mp3"
        data-title="Track Title"
        data-artist="Artist Name">
    Play
</button>

<!-- Card with full metadata -->
<div data-wb-play
     data-url="audio/beat.mp3"
     data-id="product-42"
     data-title="Trap Beat"
     data-artist="Producer"
     data-bpm="140"
     data-key="Cm"
     data-artwork="covers/beat.jpg"
     data-link="/beats/trap-beat"
     data-wb-favorited="true">
    <img src="covers/beat.jpg">
    <h3>Trap Beat</h3>
</div>

<!-- Table row -->
<tr data-wb-play
    data-url="samples/kick.wav"
    data-title="808 Kick"
    data-artist="Drum Kit Vol. 3"
    data-bpm="128">
    <td>808 Kick</td>
    <td>128 BPM</td>
</tr>
```

### Queue Trigger (`data-wb-queue`)

Add to any element to queue a track without immediately playing it.

```html

<button data-wb-queue
        data-url="audio/track.mp3"
        data-title="Queued Track"
        data-artist="Artist">
    + Add to Queue
</button>
```

### Pre-Generated Waveforms

Skip client-side audio analysis by providing pre-generated waveform data. The `data-wb-waveform` attribute accepts three
formats:

| Format        | Example                  | Description                                      |
|---------------|--------------------------|--------------------------------------------------|
| JSON file URL | `waveforms/song.json`    | Fetches peaks from `{ peaks: [...] }` or `[...]` |
| Inline array  | `[0.2, 0.37, 0.41, ...]` | JSON array string                                |
| CSV string    | `0.2,0.37,0.41,...`      | Comma-separated values                           |

```html
<!-- JSON file — fetched automatically by the player -->
<div data-wb-play
     data-url="audio/song.mp3"
     data-title="My Song"
     data-wb-waveform="waveforms/song.json">
</div>

<!-- Inline peaks -->
<div data-wb-play
     data-url="audio/song.mp3"
     data-title="My Song"
     data-wb-waveform="[0.12,0.45,0.89,0.34,0.67]">
</div>
```

Generate JSON files with [WaveformGen](https://github.com/arraypress/waveform-gen):

```bash
npx @arraypress/waveform-gen ./audio/*.mp3 --output ./waveforms/ --bpm
```

JSON waveform files can also include markers, which are loaded automatically if none are set via data attributes:

```json
{
  "peaks": [
    0.12,
    0.45,
    0.89,
    0.34,
    ...
  ],
  "markers": [
    {
      "time": 0,
      "label": "Intro"
    },
    {
      "time": 30,
      "label": "Chorus"
    }
  ]
}
```

### DJ Mode Markers

Add time-stamped markers with title/artist fields. As the mix plays, the bar updates the displayed track name, artist,
and metadata at each marker boundary.

```html

<div data-wb-play
     data-url="audio/guestmix.mp3"
     data-title="Guest Mix"
     data-artist="Various Artists"
     data-wb-markers='[
         {"time": 0, "label": "Intro", "title": "Opening Track", "artist": "DJ One"},
         {"time": 180, "label": "Drop", "title": "Big Tune", "artist": "Producer X", "bpm": "174", "key": "Am"},
         {"time": 360, "label": "Chill", "title": "Downtempo", "artist": "Ambient Artist"}
     ]'>
    Play Mix
</div>
```

Markers can include: `time` (seconds, required), `label` (required), `title`, `artist`, `artwork`, `bpm`, `key`,`color`.

The active marker on the waveform gently pulses to indicate the current section.

### Attribute Reference

| Attribute           | Description                                                               |
|---------------------|---------------------------------------------------------------------------|
| `data-wb-play`      | Makes element a play trigger (click to play)                              |
| `data-wb-queue`     | Makes element a queue trigger (click to add to queue)                     |
| `data-url`          | Audio file URL (required)                                                 |
| `data-id`           | Unique track identifier (defaults to URL)                                 |
| `data-title`        | Track title                                                               |
| `data-artist`       | Artist or subtitle                                                        |
| `data-artwork`      | Album artwork URL                                                         |
| `data-album`        | Album name (for Media Session API)                                        |
| `data-link`         | URL to navigate when clicking track info in the bar                       |
| `data-duration`     | Display duration string                                                   |
| `data-bpm`          | BPM value — displayed as a tag in the bar                                 |
| `data-key`          | Musical key — displayed as a tag in the bar                               |
| `data-meta`         | JSON object of custom metadata (e.g. `'{"genre":"Trap"}'`)                |
| `data-wb-waveform`  | Pre-generated waveform peaks: JSON array, CSV string, or `.json` file URL |
| `data-wb-markers`   | JSON array of marker objects for DJ mode                                  |
| `data-wb-favorited` | `"true"` to pre-set favorite state (server-side seeding)                  |
| `data-wb-in-cart`   | `"true"` to pre-set cart state (server-side seeding)                      |

All attributes also accept `data-wb-` prefixed versions (`data-wb-url`, `data-wb-title`, etc.) to avoid conflicts with
other libraries.

## Configuration

```javascript
WaveformBar.init({
    // Persistence
    persist: true,              // Save queue/position to sessionStorage
    autoResume: true,           // Auto-resume playback after page navigation

    // Playback
    continuous: true,           // Auto-advance to next track in queue
    repeat: 'off',              // Repeat mode: 'off', 'all', 'one'
    volume: 1,                  // Initial volume (0-1)

    // UI visibility
    showQueue: true,            // Show queue toggle button
    showPrevNext: true,         // Show prev/next skip buttons
    showRepeat: true,           // Show repeat mode button
    showVolume: true,           // Show volume popup slider
    showMute: true,             // Show mute button
    showTime: true,             // Show elapsed/total time display
    showTrackLink: true,        // Make track info clickable (navigates to data-link)
    showMeta: true,             // Show metadata tags (BPM, key, custom)
    maxMeta: 3,                 // Max number of metadata tags to display

    // Artwork
    defaultArtwork: null,       // URL to fallback artwork (shown when track has no artwork)

    // Waveform display (passed to WaveformPlayer)
    waveformStyle: 'mirror',    // 'bars', 'mirror', 'line', 'blocks', 'dots', 'seekbar'
    waveformHeight: 32,         // Waveform height in pixels
    barWidth: 2,                // Width of waveform bars
    barSpacing: 0,              // Space between waveform bars
    waveformColor: null,        // Waveform color (null = auto-detect from theme)
    progressColor: null,        // Progress color (null = auto-detect from theme)
    markerColor: 'rgba(255, 255, 255, 0.25)',  // Default marker line color

    // Storage
    storageKey: 'waveform-bar', // Key prefix for sessionStorage/localStorage

    // Server-side actions (REST callbacks)
    actions: {
        favorite: {
            endpoint: '/api/favorites',
            method: 'POST'
        },
        cart: {
            endpoint: '/api/cart',
            method: 'POST'
        }
    },

    // Callbacks
    onPlay: (track) => {
    },
    onPause: (track) => {
    },
    onTrackChange: (track, index) => {
    },
    onQueueChange: (queue, currentIndex) => {
    },
    onVolumeChange: (volume) => {
    },
    onFavorite: (track, favorited) => {
    },
    onCart: (track) => {
    }
});
```

## JavaScript API

### Playback

```javascript
WaveformBar.play({
    url: 'audio/song.mp3',
    title: 'My Song',
    artist: 'Artist',
    bpm: '128',
    key: 'Am',
    artwork: 'cover.jpg',
    link: '/products/my-song'
});

WaveformBar.play('audio/song.mp3');
WaveformBar.togglePlay();
WaveformBar.pause();
WaveformBar.next();
WaveformBar.previous();
WaveformBar.skipTo(3);
```

### Repeat

```javascript
WaveformBar.cycleRepeat();               // Cycles: off → all → one → off
WaveformBar.setRepeat('all');            // Set directly: 'off', 'all', 'one'
```

### Markers / DJ Mode

```javascript
WaveformBar.seekToMarker(3);
WaveformBar.seekToMarkerByLabel('Horizon');
```

### Volume

```javascript
WaveformBar.setVolume(0.5);
WaveformBar.getVolume();
WaveformBar.toggleMute();
```

### Queue

```javascript
WaveformBar.addToQueue({url: 'track.mp3', title: 'Next Up', artist: 'Someone'});
WaveformBar.removeFromQueue(2);
WaveformBar.clearQueue();
```

### Favorites & Cart

```javascript
WaveformBar.toggleFavorite();
WaveformBar.isFavorited('beat-001');
WaveformBar.addToCart();
WaveformBar.isInCart('beat-001');
```

### State

```javascript
WaveformBar.getCurrentTrack();
WaveformBar.isCurrentlyPlaying('song.mp3');
WaveformBar.isCurrentTrack('song.mp3');
WaveformBar.getQueue();
WaveformBar.getCurrentIndex();
WaveformBar.getPlayer();
```

### UI

```javascript
WaveformBar.show();
WaveformBar.hide();
WaveformBar.toggleQueuePanel();
WaveformBar.toggleVolumePopup();
WaveformBar.destroy();
```

## DOM Events

All events bubble from the bar element and are prefixed with `waveformbar:`.

```javascript
document.addEventListener('waveformbar:play', (e) => {
    console.log('Playing:', e.detail.track);
});
```

| Event                      | Detail                     |
|----------------------------|----------------------------|
| `waveformbar:play`         | `{ track }`                |
| `waveformbar:pause`        | `{ track }`                |
| `waveformbar:trackchange`  | `{ track, index }`         |
| `waveformbar:markerchange` | `{ marker, index, track }` |
| `waveformbar:favorite`     | `{ track, favorited }`     |
| `waveformbar:cart`         | `{ track }`                |
| `waveformbar:queuechange`  | `{ queue, currentIndex }`  |
| `waveformbar:volumechange` | `{ volume }`               |
| `waveformbar:repeatchange` | `{ mode }`                 |

## Page State Sync

WaveformBar automatically adds CSS classes to trigger elements on the page:

| Class           | Applied When                                      |
|-----------------|---------------------------------------------------|
| `.wb-current`   | The element's track URL matches the current track |
| `.wb-playing`   | The element's track is actively playing           |
| `.wb-favorited` | The element's track is favorited                  |
| `.wb-in-cart`   | The element's track is in the cart                |

## Helper CSS Classes

### Icon Swap (`wb-icon-swap`)

```html

<button data-wb-play data-url="song.mp3" class="wb-icon-swap">
    <span class="wb-show-play">▶ Play</span>
    <span class="wb-show-pause">⏸ Playing</span>
</button>
```

### Equalizer Bars (`wb-eq-bars`)

```html
<span class="wb-eq-bars"><span></span><span></span><span></span><span></span></span>
```

### Card Highlight (`wb-card-highlight`)

Adds accent border when the element's track is current.

### Accent Text (`wb-accent-current`)

Colors text with the accent color when the parent track is current.

### Favorite/Cart Visibility

```html
<span class="wb-hide-if-fav">♡ Save</span>
<span class="wb-show-if-fav">❤ Saved</span>
<span class="wb-hide-if-cart">🛒 Add</span>
<span class="wb-show-if-cart">✓ In Cart</span>
```

## Page Icons

The optional `waveform-bar-icons.css` provides a lightweight SVG icon set for use in your page elements (play/pause
overlays, hearts, carts, etc.):

```html

<link rel="stylesheet" href="https://unpkg.com/@arraypress/waveform-bar@latest/dist/waveform-bar-icons.css">

<span class="wbi wbi-play"></span>
<span class="wbi wbi-pause"></span>
<span class="wbi wbi-heart"></span>
<span class="wbi wbi-heart-filled"></span>
<span class="wbi wbi-cart"></span>
<span class="wbi wbi-cart-check"></span>
<span class="wbi wbi-queue"></span>
<span class="wbi wbi-skip-back"></span>
<span class="wbi wbi-skip-forward"></span>
<span class="wbi wbi-volume-high"></span>
<span class="wbi wbi-volume-low"></span>
<span class="wbi wbi-volume-mute"></span>
<span class="wbi wbi-repeat"></span>
<span class="wbi wbi-repeat-one"></span>
<span class="wbi wbi-close"></span>
<span class="wbi wbi-check"></span>
<span class="wbi wbi-link"></span>
<span class="wbi wbi-download"></span>
<span class="wbi wbi-share"></span>
<span class="wbi wbi-music-note"></span>
```

Icons inherit `color` from their parent and scale with `font-size`. Size variants: `.wbi-sm`, `.wbi-lg`, `.wbi-xl`,
`.wbi-2x`, `.wbi-3x`.

These are for your page elements only — the bar itself uses its own internal SVG icons and does not require this file.

## Persistence

**sessionStorage** (cleared when browser closes): queue, current track index, playback position, playing state.

**localStorage** (persists across sessions): volume level, mute state, favorite track IDs.

Cart state is intentionally NOT persisted — it seeds from `data-wb-in-cart` attributes on page load, making the server
the source of truth.

## Custom Styling

```css
.waveform-bar,
.wb-queue-panel {
    --wb-bg: rgba(20, 20, 20, 0.98);
    --wb-border: rgba(255, 255, 255, 0.1);
    --wb-text: #ffffff;
    --wb-text-muted: rgba(255, 255, 255, 0.5);
    --wb-accent: #1db954;
    --wb-accent-light: #1ed760;
    --wb-hover: rgba(255, 255, 255, 0.08);
    --wb-fav-color: #ef4444;
    --wb-cart-color: #4ade80;
}
```

## Browser Support

Chrome/Edge 90+, Firefox 88+, Safari 14+, iOS Safari, Chrome Android

## Dependencies

- [WaveformPlayer](https://github.com/arraypress/waveform-player) ≥1.5.0 — must be loaded before WaveformBar

## Ecosystem

| Package                                                                 | Description                                                       |
|-------------------------------------------------------------------------|-------------------------------------------------------------------|
| **[WaveformPlayer](https://github.com/arraypress/waveform-player)**     | Core audio player with waveform visualization                     |
| **[WaveformBar](https://github.com/arraypress/waveform-bar)**           | Persistent bottom-bar player with queue, favorites, cart, DJ mode |
| **[WaveformGen](https://github.com/arraypress/waveform-generator)**     | CLI tool to pre-generate waveform JSON from audio files           |
| **[WaveformPlaylist](https://github.com/arraypress/waveform-playlist)** | Playlist and chapter support addon                                |
| **[WaveformTracker](https://github.com/arraypress/waveform-tracker)**   | Audio engagement analytics                                        |

## License

MIT © [ArrayPress](https://github.com/arraypress)