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

### Pre-Generated Waveform Data

Skip client-side audio analysis by providing pre-generated waveform peaks.
Use [waveform-gen](https://github.com/arraypress/waveform-gen) to generate the data.

```html

<div data-wb-play
     data-url="song.mp3"
     data-title="My Song"
     data-wb-waveform='[0.12,0.45,0.89,0.34,0.67,0.92,0.15,0.78]'>
</div>
```

The waveform displays instantly on load without downloading and decoding the audio file.

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

Markers can include: `time` (seconds, required), `label` (required), `title`, `artist`, `artwork`, `bpm`, `key`,
`color`.

The active marker on the waveform gently pulses to indicate the current section.

### Attribute Reference

| Attribute           | Description                                                |
|---------------------|------------------------------------------------------------|
| `data-wb-play`      | Makes element a play trigger (click to play)               |
| `data-wb-queue`     | Makes element a queue trigger (click to add to queue)      |
| `data-url`          | Audio file URL (required)                                  |
| `data-id`           | Unique track identifier (defaults to URL)                  |
| `data-title`        | Track title                                                |
| `data-artist`       | Artist or subtitle                                         |
| `data-artwork`      | Album artwork URL                                          |
| `data-album`        | Album name (for Media Session API)                         |
| `data-link`         | URL to navigate when clicking track info in the bar        |
| `data-duration`     | Display duration string                                    |
| `data-bpm`          | BPM value — displayed as a tag in the bar                  |
| `data-key`          | Musical key — displayed as a tag in the bar                |
| `data-meta`         | JSON object of custom metadata (e.g. `'{"genre":"Trap"}'`) |
| `data-wb-waveform`  | Pre-generated waveform peaks JSON array                    |
| `data-wb-markers`   | JSON array of marker objects for DJ mode                   |
| `data-wb-favorited` | `"true"` to pre-set favorite state (server-side seeding)   |
| `data-wb-in-cart`   | `"true"` to pre-set cart state (server-side seeding)       |

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
            endpoint: '/api/favorites',     // POST URL
            method: 'POST'
        },
        cart: {
            endpoint: '/api/cart',          // POST URL
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
// Play a track object
WaveformBar.play({
    url: 'audio/song.mp3',
    title: 'My Song',
    artist: 'Artist',
    bpm: '128',
    key: 'Am',
    artwork: 'cover.jpg',
    link: '/products/my-song'
});

// Play by URL shorthand
WaveformBar.play('audio/song.mp3');

// Playback controls
WaveformBar.togglePlay();
WaveformBar.pause();
WaveformBar.next();                      // Next track (wraps if repeat: 'all')
WaveformBar.previous();                  // Previous track (restarts if >3s in)
WaveformBar.skipTo(3);                   // Jump to queue index 3
```

### Repeat

```javascript
WaveformBar.cycleRepeat();               // Cycles: off → all → one → off
WaveformBar.setRepeat('all');            // Set directly: 'off', 'all', 'one'
```

- **off** — Stops at end of queue
- **all** — Loops back to first track after last; prev/next wrap around
- **one** — Replays the current track indefinitely

### Markers / DJ Mode

```javascript
// Seek to marker by index (0-based) on current track
WaveformBar.seekToMarker(3);

// Seek to marker by label name on current track
WaveformBar.seekToMarkerByLabel('Horizon');
```

Both methods auto-play if the player is paused. They only work on the currently loaded track's markers — if the track
with markers isn't loaded, they silently return.

### Volume

```javascript
WaveformBar.setVolume(0.5);              // Set to 50%
WaveformBar.getVolume();                 // Returns 0.5
WaveformBar.toggleMute();
WaveformBar.isMutedState();              // true/false
```

Volume and mute state persist in localStorage across sessions.

### Queue

```javascript
// Add to end of queue
WaveformBar.addToQueue({url: 'track.mp3', title: 'Next Up', artist: 'Someone'});

// Remove by index
WaveformBar.removeFromQueue(2);

// Replay a previously played track (by URL)
WaveformBar.replay('audio/old-track.mp3');

// Clear upcoming tracks
WaveformBar.clearQueue();

// Clear play history
WaveformBar.clearHistory();
```

The queue panel shows three sections: **Now Playing** (click to toggle play/pause), **Up Next**, and **Previously Played
**. Tracks can be removed individually from the queue via the × button on hover.

### Favorites

```javascript
WaveformBar.toggleFavorite();            // Toggle current track's favorite state
WaveformBar.isFavorited('beat-001');     // Check by track ID
```

Favorites persist in localStorage. Server-side state can be seeded via `data-wb-favorited="true"` on trigger elements —
this is authoritative and overrides localStorage on page load.

When a track is favorited/unfavorited, the `.wb-favorited` class is toggled on all matching trigger elements on the
page.

### Cart

```javascript
WaveformBar.addToCart();                 // Add current track to cart
WaveformBar.isInCart('beat-001');        // Check by track ID
```

Cart state is NOT persisted to localStorage — it's server-authoritative. Seed from your server via
`data-wb-in-cart="true"`. The `.wb-in-cart` class is toggled on matching trigger elements.

If an `actions.cart.endpoint` is configured, a POST request fires automatically with the track data.

### State

```javascript
WaveformBar.getCurrentTrack();           // { url, title, artist, bpm, key, ... }
WaveformBar.isCurrentlyPlaying('song.mp3'); // true if this URL is actively playing
WaveformBar.isCurrentTrack('song.mp3');  // true if current (playing or paused)
WaveformBar.getQueue();                  // Full queue array
WaveformBar.getHistory();                // Previously played tracks
WaveformBar.getPlayer();                 // Underlying WaveformPlayer instance
```

### UI

```javascript
WaveformBar.show();                      // Show the bar
WaveformBar.hide();                      // Hide the bar
WaveformBar.toggleQueuePanel();          // Toggle queue panel visibility
WaveformBar.toggleVolumePopup();         // Toggle volume popup
WaveformBar.closeQueuePanel();
WaveformBar.closeVolumePopup();
WaveformBar.destroy();                   // Remove bar and clean up
```

## DOM Events

All events bubble from the bar element and are prefixed with `waveformbar:`.

```javascript
document.addEventListener('waveformbar:play', (e) => {
    console.log('Playing:', e.detail.track);
});

document.addEventListener('waveformbar:trackchange', (e) => {
    console.log('Track changed:', e.detail.track, 'Index:', e.detail.index);
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

These update in real-time as the user interacts with the bar.

## Helper CSS Classes

Ready-made utility classes for common UI patterns. Add them to your trigger elements.

### Icon Swap (`wb-icon-swap`)

Swaps play/pause content automatically based on playback state.

```html

<button data-wb-play data-url="song.mp3" class="wb-icon-swap">
    <span class="wb-show-play">▶ Play</span>
    <span class="wb-show-pause">⏸ Playing</span>
</button>
```

### Equalizer Bars (`wb-eq-bars`)

Animated equalizer bars that activate when the track is playing.

```html

<tr data-wb-play data-url="song.mp3">
    <td>
        <span class="wb-eq-bars">
            <span></span><span></span><span></span><span></span>
        </span>
    </td>
    <td>Track Title</td>
</tr>
```

### Card Highlight (`wb-card-highlight`)

Adds accent border and glow when the element's track is current.

```html

<div data-wb-play data-url="song.mp3"
     class="wb-card-highlight"
     style="border: 1px solid transparent; border-radius: 8px;">
    <h3>Track Title</h3>
</div>
```

### Accent Text (`wb-accent-current`)

Colors text with the accent color when the parent track is current.

```html

<div data-wb-play data-url="song.mp3">
    <span class="wb-accent-current">Track Title</span>
</div>
```

### Pulse Animation (`wb-pulse-playing`)

Subtle opacity pulse on playing elements.

```html

<div data-wb-play data-url="song.mp3" class="wb-pulse-playing">
    <img src="cover.jpg">
</div>
```

### Favorite/Cart Visibility

Show or hide content based on favorite/cart state.

```html

<div data-wb-play data-url="song.mp3" data-id="beat-001">
    <button>
        <span class="wb-hide-if-fav">♡ Save</span>
        <span class="wb-show-if-fav">❤ Saved</span>
    </button>
    <button>
        <span class="wb-hide-if-cart">🛒 Add to Cart</span>
        <span class="wb-show-if-cart">✓ In Cart</span>
    </button>
</div>
```

## Persistence

WaveformBar uses two storage mechanisms:

**sessionStorage** (cleared when browser closes):

- Queue contents and order
- Current track index
- Playback position
- Playing state

**localStorage** (persists across sessions):

- Volume level
- Mute state
- Favorite track IDs

When a user navigates between pages, the bar restores the queue, seeks to the saved position, and optionally resumes
playback (if `autoResume: true`). Position is saved on every page unload for accuracy.

Cart state is intentionally NOT persisted — it seeds from `data-wb-in-cart` attributes on page load, making the server
the source of truth.

## Custom Styling

Override CSS custom properties to theme the bar:

```css
.waveform-bar,
.wb-queue-panel {
    --wb-bg: rgba(20, 20, 20, 0.98);
    --wb-border: rgba(255, 255, 255, 0.1);
    --wb-text: #ffffff;
    --wb-text-muted: rgba(255, 255, 255, 0.5);
    --wb-accent: #1db954; /* e.g. Spotify green */
    --wb-accent-light: #1ed760;
    --wb-hover: rgba(255, 255, 255, 0.08);
    --wb-tag-bg: rgba(29, 185, 84, 0.12);
    --wb-tag-text: #1db954;
    --wb-fav-color: #ef4444;
    --wb-cart-color: #4ade80;
}
```

A `.wb-light` class is available for light backgrounds:

```css
.waveform-bar.wb-light {
    --wb-bg: rgba(255, 255, 255, 0.95);
    --wb-text: #1a1a1a;
    --wb-text-muted: rgba(0, 0, 0, 0.5);
}
```

## Layout

The bar uses a three-zone flex layout:

```
[Left: controls + track info] — [Centre: waveform + time] — [Right: meta + actions + volume + queue]
```

- **Left zone** — Prev, Play/Pause, Next, Repeat buttons + artwork + title/artist
- **Centre zone** — Full-width waveform visualization + elapsed/total time
- **Right zone** — BPM/key tags, favorite/cart buttons, volume popup, queue toggle

On mobile (≤768px):

- Left + Right share the top row
- Waveform drops to a full-width second row
- Meta tags, actions, and time display are hidden
- Queue panel becomes full-width

On small mobile (≤480px):

- Prev/Next and Repeat buttons are hidden
- Volume is hidden
- Only play button, track info, and waveform remain

## Use Cases

### Beat Store

```html

<div class="beat-card wb-card-highlight"
     data-wb-play
     data-url="beats/trap-42.mp3"
     data-id="beat-42"
     data-title="Trap Beat #42"
     data-artist="ProducerName"
     data-bpm="140"
     data-key="Cm"
     data-artwork="covers/trap-42.jpg"
     data-link="/beats/trap-42"
     data-wb-favorited="true">
    <img src="covers/trap-42.jpg">
    <h3 class="wb-accent-current">Trap Beat #42</h3>
    <p>140 BPM · Cm · $29.99</p>
    <span class="wb-eq-bars"><span></span><span></span><span></span><span></span></span>
    <button>
        <span class="wb-hide-if-fav">♡ Save</span>
        <span class="wb-show-if-fav">❤ Saved</span>
    </button>
</div>
<button data-wb-queue data-url="beats/trap-42.mp3" data-title="Trap Beat #42">+ Queue</button>
```

### Sample Library Table

```html

<table>
    <tr data-wb-play
        data-url="samples/kick.wav"
        data-title="808 Kick"
        data-artist="Drum Kit Vol. 3"
        data-bpm="128"
        data-meta='{"format":"WAV"}'>
        <td><span class="wb-eq-bars"><span></span><span></span><span></span><span></span></span></td>
        <td class="wb-accent-current">808 Kick</td>
        <td>128 BPM</td>
        <td>WAV</td>
    </tr>
</table>
```

### DJ Mix with Clickable Tracklist

```html
<!-- Mix trigger with markers -->
<div data-wb-play
     data-url="mixes/guestmix.mp3"
     data-title="Guest Mix"
     data-artist="Various Artists"
     data-wb-waveform='[0.1,0.3,0.5,...]'
     data-wb-markers='[
         {"time":0,"label":"Intro","title":"Opening","artist":"DJ One"},
         {"time":180,"label":"Drop","title":"Big Tune","artist":"Producer X"},
         {"time":360,"label":"Chill","title":"Wind Down","artist":"Ambient Co"}
     ]'>
    🎧 Play Guest Mix
</div>

<!-- Clickable tracklist buttons -->
<button onclick="WaveformBar.seekToMarkerByLabel('Intro')">00:00 — DJ One — Opening</button>
<button onclick="WaveformBar.seekToMarkerByLabel('Drop')">03:00 — Producer X — Big Tune</button>
<button onclick="WaveformBar.seekToMarkerByLabel('Chill')">06:00 — Ambient Co — Wind Down</button>
```

### Podcast

```html

<button data-wb-play
        data-url="episodes/ep42.mp3"
        data-title="Ep 42: The Future of AI"
        data-artist="with Dr. Sarah Chen"
        data-artwork="ep42-cover.jpg"
        data-link="/episodes/42"
        class="wb-icon-swap">
    <span class="wb-show-play">▶ Listen</span>
    <span class="wb-show-pause">⏸ Playing</span>
</button>
```

## Pre-Generating Waveforms

Use [@arraypress/waveform-gen](https://github.com/arraypress/waveform-gen) to batch-generate waveform data:

```bash
# Generate JSON files for all audio
npx @arraypress/waveform-gen ./audio/*.mp3 --output ./waveforms/

# Generate ready-to-paste HTML markup
npx @arraypress/waveform-gen ./audio/*.mp3 --format html --output ./
```

Then reference the data in your HTML:

```html

<div data-wb-play
     data-url="song.mp3"
     data-title="My Song"
     data-wb-waveform='[0.12,0.45,0.89,0.34,0.67]'>
</div>
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Dependencies

- [WaveformPlayer](https://github.com/arraypress/waveform-player) ≥1.3.5 — must be loaded before WaveformBar

## License

MIT © [ArrayPress](https://github.com/arraypress)

## Related

- [WaveformPlayer](https://github.com/arraypress/waveform-player) — Core audio player with waveform visualization
- [WaveformPlaylist](https://github.com/arraypress/waveform-playlist) — On-page playlist and chapter navigation
- [WaveformGen](https://github.com/arraypress/waveform-generator) — CLI tool for batch waveform data generation