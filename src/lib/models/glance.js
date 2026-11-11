import { keyOf } from './kept.js';

/**
 * What the add-on's button says at a glance of the website open, from joblist's counts
 * (counts.json, read once in a while: never a request per site) and the organizations kept:
 * its open jobs, that joblist knows it, or that it is kept.
 * @typedef {{offers: Record<string, number>, known: string[]}} Counts
 * @typedef {{key: string, jobs: number, known: boolean, saved: boolean}} Glance
 */

/** The organization a site is: its domain, else the one above it (careers.acme.org: acme.org). @param {string} host @param {Counts} counts */
function keyFor(host, counts) {
	const known = new Set(counts.known);
	const parts = host.split('.');
	for (let i = 0; i < parts.length - 1 && i < 3; i++) {
		const key = parts.slice(i).join('.');
		if (known.has(key) || key in counts.offers) return key;
	}
	return '';
}

/**
 * @param {string} url the page open
 * @param {Counts} counts
 * @param {{url: string}[]} kept
 * @returns {Glance | null} null for a page not on the web
 */
export function glanceOf(url, counts, kept) {
	let page;
	try {
		page = new URL(url);
	} catch {
		return null;
	}
	if (!/^https?:$/.test(page.protocol)) return null;
	const own = keyOf(url);
	const key = own ? keyFor(own, counts) : '';
	const jobs = key ? counts.offers[key] || 0 : 0;
	const home = `${page.origin}`;
	const saved = kept.some((k) => (key && keyOf(k.url) === key) || (own && keyOf(k.url) === own) || k.url === home || k.url === url);
	return { key, jobs, known: Boolean(key), saved };
}

/**
 * The button's badge, green when joblist knows the organization: its open jobs, else ✓;
 * ★ when only kept here; nothing else.
 * @param {Glance | null} glance
 * @returns {{text: string, color: string}}
 */
export function badgeOf(glance) {
	if (!glance) return { text: '', color: '' };
	if (glance.jobs) return { text: glance.jobs > 999 ? '999+' : String(glance.jobs), color: '#1a7f37' };
	if (glance.known) return { text: '✓', color: '#1a7f37' };
	if (glance.saved) return { text: '★', color: '#111111' };
	return { text: '', color: '' };
}
