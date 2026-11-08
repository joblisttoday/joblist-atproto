/**
 * What each route answers, from its snapshot file: an HTML page, a feed or a sitemap.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { page } from '../indexer/html.js';
import { sitemap } from '../indexer/sitemap.js';
import { feedPath, fieldOf, isSlug, landingPath } from '../src/lib/models/landing.js';
import { atom } from './feed.js';
import { searchFeed } from './search-feed.js';
import { indexMeta, landingMeta } from './pages.js';
import { pageTitle, t } from './text.js';

/**
 * @typedef {import('./routes.js').Route} Route
 * @typedef {{body: string, type: 'html' | 'atom' | 'xml'}} Rendered
 */

/**
 * @param {Route} found any route but a redirect
 * @param {any} data its snapshot file (routes.js fileOf)
 * @param {string} template the app's HTML shell
 * @returns {Rendered}
 */
export function render(found, data, template) {
	switch (found.kind) {
		case 'cities':
		case 'fields':
			return { type: 'html', body: page(template, indexMeta(found.kind, data)) };
		case 'page':
			return { type: 'html', body: page(template, landingMeta(found, data)) };
		case 'sitemap':
			return { type: 'xml', body: sitemap(config.url, placePaths(data)) };
		case 'feed':
			return { type: 'atom', body: feed(found, data) };
		default:
			throw new Error('nothing to render');
	}
}

/**
 * @param {{city?: string, field?: string, company?: string, search?: string, list?: {did: string, rkey: string}}} found
 * @param {any} data
 */
function feed(found, data) {
	if (found.search) return searchFeed(found.search, data);
	const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
	if (found.company) {
		// A company's file (index.js companyFiles): its jobs, without its key on each.
		const key = found.company;
		const name = String(data?.name || key);
		return atom({
			title: t('landing.company', { company: name }),
			subtitle: t('landing.follow.help'),
			path: feedPath({ company: key }),
			page: `/company/${key}`,
			jobs: jobs.map((/** @type {any} */ j) => ({ ...j, c: key })),
			names: { [key]: name },
			generatedAt: data?.generatedAt
		});
	}
	if (found.list) {
		// A list's file (indexer/list-files.js): its organizations' jobs, with their names.
		return atom({
			title: `${t('embed.list.title', { name: String(data?.name || found.list.rkey) })} · ${config.name}`,
			subtitle: t('landing.follow.help'),
			path: feedPath({ list: found.list }),
			page: `/${found.list.did}/${found.list.rkey}`,
			jobs,
			names: data?.names || {},
			generatedAt: data?.generatedAt
		});
	}
	const city = String(data?.name || found.city || '');
	const any = found.city || found.field;
	return atom({
		title: `${pageTitle(found, city)} · ${config.name}`,
		subtitle: any ? t('landing.intro', { count: Number(data?.count) || 0 }) : t('landing.newest.intro'),
		path: feedPath(found),
		page: any ? landingPath(found) : '/',
		jobs,
		names: data?.names || {},
		generatedAt: data?.generatedAt
	});
}

/**
 * Every page per city and field, for search engines, with when it last changed
 * (its newest job; the pages of a city and a field: not known, left out).
 * @param {any} index landing/index.json
 * @returns {{path: string, updated?: string}[]}
 */
export function placePaths(index) {
	const known = (/** @type {any} */ slug) => !!fieldOf(slug);
	const cities = (index?.cities || []).filter((/** @type {any} */ c) => isSlug(c?.slug));
	const fields = (index?.fields || []).filter((/** @type {any} */ f) => known(f?.slug));
	const date = (/** @type {any} */ value) => (typeof value === 'string' ? value : undefined);
	const newest = [...cities, ...fields].map((x) => date(x.updated) || '').reduce((a, b) => (b > a ? b : a), '') || undefined;
	return [
		{ path: '/in', updated: newest },
		{ path: '/field', updated: newest },
		...cities.map((/** @type {any} */ c) => ({ path: landingPath({ city: c.slug }), updated: date(c.updated) })),
		...fields.map((/** @type {any} */ f) => ({ path: landingPath({ field: f.slug }), updated: date(f.updated) })),
		...cities.flatMap((/** @type {any} */ c) =>
			(Array.isArray(c.fields) ? c.fields : []).filter(known).map((/** @type {string} */ field) => ({ path: landingPath({ city: c.slug, field }) }))
		)
	];
}
