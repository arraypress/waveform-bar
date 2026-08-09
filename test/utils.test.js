import { describe, it, expect } from 'vitest';
import { isSafeHref, parseTrackFromElement, formatTime } from '../src/js/utils.js';

describe('formatTime', () => {
	it('formats M:SS, staying in minutes past an hour', () => {
		expect(formatTime(0)).toBe('0:00');
		expect(formatTime(125)).toBe('2:05');
		expect(formatTime(3905)).toBe('65:05');
	});

	// A streamed / unseekable source reports `duration === Infinity`, which is
	// truthy and not NaN — so it slipped both guards and put a literal
	// 'Infinity:NaN' in the bar's time display.
	it('renders a non-finite duration as zero rather than "Infinity:NaN"', () => {
		expect(formatTime(Infinity)).toBe('0:00');
		expect(formatTime(-Infinity)).toBe('0:00');
		expect(formatTime(NaN)).toBe('0:00');
		expect(formatTime(-30)).toBe('0:00');
		expect(formatTime(undefined)).toBe('0:00');
		expect(formatTime('nonsense')).toBe('0:00');
	});
});

describe('isSafeHref', () => {
	it('allows http/https/relative, rejects script-bearing schemes', () => {
		expect(isSafeHref('https://x.com/a')).toBe(true);
		expect(isSafeHref('http://x.com')).toBe(true);
		expect(isSafeHref('/relative/path')).toBe(true);
		expect(isSafeHref('song.mp3')).toBe(true);
		expect(isSafeHref('javascript:alert(1)')).toBe(false);
		expect(isSafeHref('data:text/html,<script>alert(1)</script>')).toBe(false);
		expect(isSafeHref('vbscript:msgbox')).toBe(false);
		expect(isSafeHref('')).toBe(false);
		expect(isSafeHref(null)).toBe(false);
		expect(isSafeHref(undefined)).toBe(false);
	});
});

describe('parseTrackFromElement shape coercion', () => {
	const mk = (data) => {
		const el = document.createElement('div');
		Object.assign(el.dataset, data);
		return el;
	};

	it('coerces wrong-shape-but-valid JSON for markers/meta/waveform without throwing', () => {
		const el = mk({
			wbUrl: 'a.mp3',
			wbMarkers: '"x"',     // valid JSON, not an array → []
			wbMeta: '[1,2]',      // valid JSON, array not object → {}
			wbWaveform: '"nope"', // valid JSON, not an array → null
		});
		let t;
		expect(() => { t = parseTrackFromElement(el); }).not.toThrow();
		expect(t.markers).toEqual([]);
		expect(t.meta).toEqual({});
		expect(t.waveform).toBe(null);
	});

	it('survives unparseable JSON in all three fields', () => {
		const el = mk({ wbUrl: 'a.mp3', wbMarkers: '{bad', wbMeta: '{bad', wbWaveform: '{bad' });
		const t = parseTrackFromElement(el);
		expect(t.markers).toEqual([]);
		expect(t.meta).toEqual({});
		expect(t.waveform).toBe(null);
	});

	it('coerces marker times to finite numbers and drops unusable entries', () => {
		const el = mk({
			wbUrl: 'a.mp3',
			wbMarkers: JSON.stringify([
				{ time: '30', label: 'A' },  // string time → 30
				{ time: 'bad', label: 'B' }, // NaN → dropped
				{ label: 'no-time' },        // missing time → dropped
				42,                          // non-object → dropped
				{ time: 90, label: 'C' },    // valid
			]),
		});
		const t = parseTrackFromElement(el);
		expect(t.markers).toEqual([
			{ time: 30, label: 'A' },
			{ time: 90, label: 'C' },
		]);
	});

	it('passes a valid waveform array and meta object through unchanged', () => {
		const el = mk({ wbUrl: 'a.mp3', wbWaveform: '[0.1,0.5,0.9]', wbMeta: '{"genre":"house"}' });
		const t = parseTrackFromElement(el);
		expect(t.waveform).toEqual([0.1, 0.5, 0.9]);
		expect(t.meta).toEqual({ genre: 'house' });
	});

	it('defaults to []/{} and null when the attributes are absent', () => {
		const el = mk({ wbUrl: 'a.mp3' });
		const t = parseTrackFromElement(el);
		expect(t.markers).toEqual([]);
		expect(t.meta).toEqual({});
		expect(t.waveform).toBe(null);
	});

	it('returns null when there is no url', () => {
		expect(parseTrackFromElement(mk({ wbTitle: 'No URL' }))).toBe(null);
	});
});
