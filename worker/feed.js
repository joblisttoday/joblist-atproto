/**
 * Atom feeds (RFC 4287) of the newest jobs: everywhere, per city, per field,
 * per company. Entries are dated when the job was first seen (indexer/ledger.js).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { escape } from '../indexer/html.js';
import { isCompanyKey } from '../src/lib/models/landing.js';
import { isoDate, toItem } from './text.js';

/**
 * Text safe in XML: escaped, without the characters XML 1.0 forbids (a job title
 * with a control character would make the whole feed unreadable).
 * @param {unknown} value
 */
export function xml(value) {
	return escape(value).replace(/[^\t\n\r -퟿-�\u{10000}-\u{10FFFF}]/gu, '');
}

/**
 * @param {{title: string, subtitle: string, path: string, page: string, jobs: any[], names: Record<string, unknown>, generatedAt: unknown}} feed
 *   path: the feed's own address; page: the page it follows; jobs and names: as in a snapshot file.
 */
export function atom({ title, subtitle, path, page, jobs, names, generatedAt }) {
	const self = config.url + path;
	const fallback = isoDate(generatedAt) || new Date(0).toISOString().replace('.000Z', 'Z');
	const items = jobs
		.slice(0, config.landing.shown)
		.map((row) => toItem(row, names))
		// One entry per link: an entry's id is its link.
		.filter((item, i, all) => item !== null && all.findIndex((other) => other?.url === item.url) === i);
	const dates = items.map((item) => item.date || fallback);
	// The feed changed when its newest entry appeared.
	const updated = dates.reduce((a, b) => (b > a ? b : a), '') || fallback;
	const entries = items.map((item, i) => {
		const author = isCompanyKey(item.company)
			? `<author><name>${xml(item.companyName)}</name><uri>${xml(`${config.url}/${item.company}`)}</uri></author>`
			: `<author><name>${xml(item.companyName || config.name)}</name></author>`;
		const summary = [item.companyName, item.location, item.workplace].filter(Boolean).join(' · ');
		return [
			'<entry>',
			`<id>${xml(item.url)}</id>`,
			`<title>${xml(item.title)}</title>`,
			`<link rel="alternate" type="text/html" href="${xml(item.url)}"/>`,
			`<updated>${dates[i]}</updated>`,
			author,
			`<summary>${xml(summary)}</summary>`,
			'</entry>'
		].join('');
	});
	return [
		'<?xml version="1.0" encoding="utf-8"?>',
		'<feed xmlns="http://www.w3.org/2005/Atom">',
		`<id>${xml(self)}</id>`,
		`<title>${xml(title)}</title>`,
		`<subtitle>${xml(subtitle)}</subtitle>`,
		`<link rel="self" type="application/atom+xml" href="${xml(self)}"/>`,
		`<link rel="alternate" type="text/html" href="${xml(config.url + page)}"/>`,
		`<updated>${updated}</updated>`,
		`<author><name>${xml(config.name)}</name><uri>${xml(config.url)}</uri></author>`,
		`<generator uri="${xml(config.url)}">${xml(config.name)}</generator>`,
		`<icon>${xml(`${config.url}/icon-192.png`)}</icon>`,
		...entries,
		'</feed>',
		''
	].join('\n');
}
