# Changelog

All notable changes to this project will be documented in this file.

## [1.2.1] - 2026-03-22

### Removed

- Removed `configPath` option (dead code from experimental feature that was never functional in a published release)

### Fixed

- Fixed `waveform-bar-icons.css` missing base `.wbi` class — icons now render correctly
- Fixed broken comment block and duplicate `.wbi-heart-filled` rule in icons CSS
- Removed debug `console.log` from session restore