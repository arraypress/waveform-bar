# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.11.3] — 2026-08-11

### Fixed

- **The play triangle is optically centred in the round play button.** Flexbox
  centres the icon's *box*, but a right-pointing triangle carries its visual
  weight on the flat left edge, so a box-centred glyph reads as sitting left of
  the circle's centre. `waveform-player` has corrected this on the identical
  glyph since forever (`.waveform-icon-play svg`); the bar had no equivalent
  rule at all, so the two components looked different side by side. Thanks to
  [@sporteka2](https://github.com/sporteka2) for reporting in
  [#1](https://github.com/arraypress/waveform-bar/issues/1).
- **A corrupted or version-skewed persisted queue no longer breaks restore.**
  `restoreQueueState` accepted anything with a truthy `queue.length` — and
  `'abc'.length` is 3 — so a stored value of the wrong shape passed the guard and
  then threw at the first `queue.findIndex()`, leaving the bar half-initialised.
  The queue is now shape-checked as an array of tracks with URLs, entries that
  aren't usable are dropped, and a `currentIndex` that doesn't address the
  restored queue resets to 0 instead of stranding the bar on a track that isn't
  there. Session storage is only as trustworthy as the last thing that wrote it.

## [1.11.2] — 2026-08-09

### Fixed

- **`formatTime()` put `'Infinity:NaN'` in the bar's time display** for a
  streamed or unseekable source, which reports `audio.duration === Infinity` —
  truthy and not `NaN`, so it passed both guards, and `Infinity % 60` is `NaN`.
  Non-finite, non-numeric and negative input now renders `'0:00'`. Same class of
  bug as the core player's `formatTime`, fixed there in 1.24.2.

## [1.11.1] — 2026-08-09

### Fixed

- **Bar theme auto-detection had its own copy of the core player's
  transparent-background bug.** On any page that doesn't paint `<body>`, the
  computed background is `rgba(0, 0, 0, 0)`; the bar scored that as pure black
  and pinned itself to the dark theme on white pages. Same root cause as
  [waveform-player#21](https://github.com/arraypress/waveform-player/issues/21).

### Changed

- Detection now delegates to `WaveformPlayer.utils.detectColorScheme` when the
  installed core player provides it (1.24.1+), so the bar and the inline players
  can't disagree about the page theme. The local implementation stays as a
  fallback for older player builds — the peer range is unchanged — and has been
  fixed to match: it composites `<body>` and `<html>` backgrounds over the
  browser canvas and reads that canvas from the page's resolved text colour,
  falling back to `prefers-color-scheme` only when no text colour resolves.
- Detection deliberately starts at `<body>`, never at the bar element: the bar
  paints its own `--wb-bg`, so walking from itself would just read back the
  theme it already had.

## [1.11.0] — 2026-07-22

### Added

- **`crossOrigin` config option.** Forwarded to the embedded `<audio>` player
  (`'anonymous'` | `'use-credentials'` | `null`). Defaults to `null` — the bar
  no longer implies any CORS mode, matching the core player's new default, so
  CDN-hosted media without `Access-Control-Allow-Origin` plays out of the box.
  Only passed to the player when truthy. Pairs with
  `@arraypress/waveform-player@^1.23.0`.

## [1.10.0] — 2026-07-05

### Added

- **Forward the core player's localizable UI strings.** `seekValueText`,
  `playPauseLabel`, `speedLabel`, `artworkAlt`, and `unknownTrackText` are now
  accepted in the bar config and passed through to the embedded player (each
  defaults to `null` → the player's own default). Only `seekValueText` (the
  bar's visible seek slider) and `unknownTrackText` (the embedded self-mode
  player's Media Session title fallback) have a visible effect — the bar hides
  the player's own controls/info — but the rest are forwarded for completeness.
  Requires `@arraypress/waveform-player@^1.20.0` for the new options.

## [1.9.1] — 2026-07-02

### Changed

- **Mobile classic (Spotify) layout.** On phones the classic bar now lays out as
  a single row — artwork + title/artist left, transport centred, secondary
  controls right — with the seek bar as a full-width draggable strip below. The
  64px now-playing artwork applies at all widths; the volume slider and BPM badge
  are hidden on the classic mobile row so it does not crowd.
- **Queue as a native mobile sheet.** The queue panel is now full-width,
  edge-to-edge and fused to the top of the bar. The bar publishes its height as a
  `--wb-height` CSS variable (via `ResizeObserver`) so the sheet sits flush
  regardless of layout or artwork height.

## [1.9.0] — 2026-07-01

### Added

- **Lock-screen skip-track buttons.** Wires the embedded player's `onNextTrack`
  / `onPreviousTrack` to the bar's queue, so the OS Media Session next/previous
  controls advance the queue. (Needs `@arraypress/waveform-player` >= 1.19.)

## [1.8.0] — 2026-07-01

### Added

- **Gradient direction passthrough.** Forwards the player's `waveformGradient`
  (`'vertical' | 'horizontal' | 'diagonal'`) to the embedded player, so a
  gradient `waveformColor` / `progressColor` can sweep across the bar's waveform.

## [1.7.0] — 2026-07-01

### Added

- **Classic (Spotify-style) mode.** `mode: 'waveform' | 'classic'` — `'classic'`
  lays the bar out in three columns: now-playing on the left, transport centred
  over a full-width seek bar, secondary controls on the right. `'waveform'`
  (default) keeps the existing full-width waveform layout.
- **Shuffle.** `showShuffle` adds a shuffle toggle to the transport and
  `shuffle` sets its initial state (random queue advance on next / auto-advance).

### Changed

- **Simplified layout config to two modes.** `mode` supersedes the old
  `layout` / `waveform` combination; `wide` gives waveform mode a full-width size.
- **Queue + collapse accessibility.** The queue button now exposes
  `aria-haspopup` / `aria-expanded` (open/closed state is announced) and closes
  on `Escape`, returning focus to the trigger; the collapse button keeps its
  `aria-expanded` in sync.

### Removed

- **`maxWidth`** config option — superseded by `mode` / `wide` sizing.

## [1.6.4] - 2026-06-30

### Fixed

- **Volume slider collapsed to a tiny stub when the host page styles range
  inputs.** The vertical slider is a horizontal range input rotated -90°. A
  generic `input[type="range"] { width: 100% }` on the host page (specificity
  `0,1,1`) out-specified the bar's `.wb-volume-slider` rule (`0,1,0`), shrinking
  the slider to the 40px popup width — a 40px stub after rotation. The bar's
  slider rules are now scoped under `.wb-volume-popup` (`0,2,0`, plus a pinned
  `flex-shrink: 0`) so the bar's own sizing wins regardless of host form-control
  styles.

## [1.3.2] - 2026-06-27

### Changed

- Raised the `@arraypress/waveform-player` peer dependency floor to `^1.7.2`, which ships the native accessible (keyboard / ARIA) seek slider. In external mode the player dispatches `waveformplayer:request-seek` on keyboard seek — already handled by the bar — so keyboard seeking on inline player surfaces now routes through the bar with no code changes here.

## [1.3.1] - 2026-05-13

### Fixed

- **Cross-page state seed** — when a new external WaveformPlayer instance is discovered after the bar is already playing (typical SPA / page-navigation flow: hit Play on a card → navigate to the product page → inline player mounts), the bar now immediately seeds the newly-discovered player with `setPlayingState()` and `setProgress()` so its canvas reflects the live bar state without waiting for the next `timeupdate` tick.

## [1.3.0] - 2026-05-13

### New Features

- **External WaveformPlayer integration** — when `@arraypress/waveform-player` 1.6+ instances are mounted with `audioMode: 'external'` (`data-audio-mode="external"`), WaveformBar now discovers them automatically and treats them as synchronized visual surfaces. Click the inline player's play button → playback happens in the bar; the bar's progress mirrors into the inline canvas in real time.

  No configuration needed — the bar scans for matching players on init + MutationObserver tick, and listens for `waveformplayer:request-play`, `waveformplayer:request-pause`, and `waveformplayer:request-seek` events at the document level. Any inline player whose URL matches the currently-playing track gets `setPlayingState(true)` and `setProgress(...)` calls pumped to it.

  ```html
  <!-- Same element doubles as a bar trigger (data-wb-play) AND an
       inline visual surface (data-waveform-player + audio-mode). -->
  <div data-waveform-player
       data-audio-mode="external"
       data-url="song.mp3"
       data-waveform-style="bars"
       data-wb-play
       data-wb-url="song.mp3"
       data-wb-title="..."></div>
  ```

### Backward Compatibility

Fully additive. Stores / pages that don't render any external-mode WaveformPlayer instances behave exactly as before — the discovery scan returns an empty Map, the pump methods short-circuit. Existing `[data-wb-play]` triggers without the player markup continue to work unchanged.

## [1.2.1] - 2026-03-22

### Removed

- Removed `configPath` option (dead code from experimental feature that was never functional in a published release)

### Fixed

- Fixed `waveform-bar-icons.css` missing base `.wbi` class — icons now render correctly
- Fixed broken comment block and duplicate `.wbi-heart-filled` rule in icons CSS
- Removed debug `console.log` from session restore