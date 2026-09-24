import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));

describe('peer dependency floor', () => {
	// External mode crashed before waveform-player 1.8.0, and the bar relies
	// on APIs that arrived there: setProgress()/setPlayingState(),
	// loadTrack(..., { autoplay: false }), the destroy event, barRadius.
	it('requires @arraypress/waveform-player >= 1.8.0', () => {
		const range = pkg.peerDependencies['@arraypress/waveform-player'];
		const [major, minor] = range.replace(/^[^\d]*/, '').split('.').map(Number);
		expect(major > 1 || (major === 1 && minor >= 8)).toBe(true);
	});
});
