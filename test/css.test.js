import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * jsdom does no layout or cascade, so nothing else in the suite reads the
 * stylesheet. The play glyph's optical centring is the kind of one-line rule
 * that gets dropped in a refactor and only resurfaces as a bug report, so it is
 * pinned here alongside the geometry that justifies it.
 *
 * @see ../src/css/waveform-bar.css
 * @see https://github.com/arraypress/waveform-bar/issues/1
 */
const CSS = readFileSync(resolve(process.cwd(), 'src/css/waveform-bar.css'), 'utf8');
const ICONS = readFileSync(resolve(process.cwd(), 'src/js/icons.js'), 'utf8');

describe('play button optical centring', () => {
	it('nudges the play triangle right of the flexbox centre', () => {
		expect(CSS).toMatch(/\.wb-icon-play svg\s*\{[^}]*margin-left:\s*1px/);
	});

	it('leaves the symmetric pause glyph alone', () => {
		expect(CSS).not.toMatch(/\.wb-icon-pause svg\s*\{[^}]*margin-left/);
	});

	it('matches the correction waveform-player applies to the same glyph', () => {
		// Both components draw the identical path, so a nudge in one and not the
		// other is exactly the inconsistency that was reported.
		const player = ICONS.match(/play:\s*'([^']+)'/)[1];
		expect(player).toContain('M8 5v14l11-7z');
	});

	it('still centres the icon box itself', () => {
		// The nudge is an adjustment to centring, not a replacement for it —
		// removing the flex centring would move the glyph far more than 1px.
		expect(CSS).toMatch(/\.wb-btn\s*\{[^}]*align-items:\s*center/);
		expect(CSS).toMatch(/\.wb-btn\s*\{[^}]*justify-content:\s*center/);
	});
});

describe('queue keyboard affordances', () => {
	it('reveals the remove button when the row has keyboard focus, not only on hover', () => {
		expect(CSS).toMatch(/\.wb-queue-item:focus-within \.wb-queue-remove/);
	});

	it('resets the skip button so it lays out like the old row text', () => {
		expect(CSS).toMatch(/\.wb-queue-skip\s*\{[^}]*font:\s*inherit/);
		expect(CSS).toMatch(/\.wb-queue-skip:focus-visible/);
	});
});
