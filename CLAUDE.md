# CLAUDE.md — @arraypress/waveform-bar

Persistent bottom-bar player singleton: `window.WaveformBar.init(config)`. Embeds one
self-mode `WaveformPlayer`, and drives inline `external`-mode players on the page via
`data-wb-*` triggers.

## Commands
- `npm test` — vitest (run before committing).
- `npm run build` — iife + esm + min + css. `prepublishOnly` runs it.
- `npm run size` — gzipped JS/CSS.
- `npm run dev` — watch build.

## The rule that matters: config is an allowlist, not a spread

Adding a config key takes **two** edits in `src/js/core.js`, and skipping the second
fails **silently** — no error, the option just never reaches the player:

1. Add the key to the `DEFAULTS` object (~line 23).
2. Add a forward line in `_initPlayer()`, next to the colour forwards (~line 648):
   ```js
   if (this.config.<key>) opts.<key> = this.config.<key>;
   ```

There is no spread of `this.config` into `opts` anywhere — if it isn't on that list,
it doesn't propagate. Grep `opts\.\w* = this\.config` to see the full current set.

## Architecture (`src/js/`)
- `core.js` — the singleton, `DEFAULTS`, `_initPlayer()`, lifecycle.
- `actions.js` — `data-wb-*` trigger wiring. `queue.js` — track queue.
- `dom.js` — bar markup. `icons.js` — inline SVG. `storage.js` — persistence.
- `utils.js`, `index.js` — entry + `window.WaveformBar`.

## Conventions
- **Ships no `index.d.ts`.** The four `waveform-bar-*` wrappers hand-declare
  `WaveformBarConfig` in their own `src/types.ts`. Nothing links those types to
  `DEFAULTS` here, so they drift silently — a new config key means editing all four.
- Peer dep on `@arraypress/waveform-player@^1.x`; `dist/` is committed.
- Logging prefix `[WaveformBar]`.

## Cross-repo
An option change here is usually part of a 15-package family batch —
load the `waveform-release` skill rather than editing this repo alone.
