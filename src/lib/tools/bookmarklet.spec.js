import { describe, expect, it } from 'vitest';
import { addToJoblist, bookmarklet } from './bookmarklet.js';

/**
 * A page, just enough for the bookmarklet.
 * @param {{href: string, title?: string, siteName?: string, links?: string[]}} page
 */
function fakePage({ href, title = '', siteName, links = [] }) {
	return /** @type {Document} */ (
		/** @type {unknown} */ ({
			title,
			location: { href },
			querySelector: () => (siteName ? { getAttribute: () => siteName } : null),
			querySelectorAll: () => links.map((link) => ({ getAttribute: (/** @type {string} */ name) => (name === 'href' ? link : null) }))
		})
	);
}

/** @param {Parameters<typeof fakePage>[0]} page */
function run(page) {
	/** @type {string[]} */
	const opened = [];
	addToJoblist('https://joblist.example', fakePage(page), { open: (url) => (opened.push(String(url)), null) });
	return new URL(opened[0]);
}

describe('bookmarklet', () => {
	it('sends the page, its name and the job board it links to', () => {
		const url = run({
			href: 'https://www.acme.org/jobs',
			title: 'Jobs | Acme',
			siteName: 'Acme',
			links: ['/', 'mailto:x@acme.org', '#top', 'https://jobs.lever.co/acme/42']
		});
		expect(url.origin + url.pathname).toBe('https://joblist.example/add');
		expect(Object.fromEntries(url.searchParams)).toEqual({
			url: 'https://www.acme.org/jobs',
			name: 'Acme',
			board: 'https://jobs.lever.co/acme/42'
		});
	});
	it('uses a short title as the name, and leaves out a long one', () => {
		expect(run({ href: 'https://acme.org/', title: 'Acme' }).searchParams.get('name')).toBe('Acme');
		expect(run({ href: 'https://acme.org/', title: 'Careers - Acme' }).searchParams.get('name')).toBe('');
		expect(run({ href: 'https://acme.org/' }).searchParams.get('board')).toBe('');
	});
	it('is a javascript: link calling itself with the origin', () => {
		const link = bookmarklet('https://joblist.example');
		expect(link.startsWith('javascript:(')).toBe(true);
		expect(link.endsWith(')("https://joblist.example")')).toBe(true);
	});
});
