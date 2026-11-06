import { describe, expect, it } from 'vitest';
import { nextPath } from './next.js';

const next = (/** @type {string} */ value) => nextPath(new URLSearchParams({ next: value }));

describe('nextPath', () => {
	it('keeps a path on this site', () => {
		expect(next('/alice.bsky.social/3abc?suggest')).toBe('/alice.bsky.social/3abc?suggest');
	});
	it('refuses other sites', () => {
		expect(next('https://example.org')).toBe(null);
		expect(next('//example.org')).toBe(null);
		expect(next('/\\example.org')).toBe(null);
		expect(next('/\t/example.org')).toBe(null);
		expect(next('/\n/example.org')).toBe(null);
		expect(nextPath(new URLSearchParams())).toBe(null);
	});
});
