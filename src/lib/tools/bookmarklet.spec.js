import { describe, expect, it } from 'vitest';
import { addToJoblist, bookmarklet } from './bookmarklet.js';

/** @param {string} href */
function run(href) {
	/** @type {string[]} */
	const opened = [];
	addToJoblist('https://joblist.example', /** @type {any} */ ({ location: { href } }), { open: (url) => (opened.push(String(url)), null) });
	return new URL(opened[0]);
}

describe('bookmarklet', () => {
	it("opens joblist on the page, its address after the '#' only", () => {
		const url = run('https://www.acme.org/jobs?x=1');
		expect(url.origin + url.pathname + url.search).toBe('https://joblist.example/me/organization');
		expect(new URLSearchParams(url.hash.slice(1)).get('url')).toBe('https://www.acme.org/jobs?x=1');
	});
	it('is a javascript: link calling itself with the origin, short', () => {
		const link = bookmarklet('https://joblist.example');
		expect(link.startsWith('javascript:(')).toBe(true);
		expect(link.endsWith(')("https://joblist.example")')).toBe(true);
		expect(link.length).toBeLessThan(400);
	});
});
