# Changelog

All notable changes to this project will be documented in this file.

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