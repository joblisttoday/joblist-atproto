/**
 * The pages per city and field, and their indexes, as the HTML a search engine
 * or a link preview reads (indexer/html.js page(): the app starts on top of it).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { escape, jsonLd } from '../indexer/html.js';
import { explorerPath, feedPath, indexFile, isCompanyKey, landingFile, landingPath } from '../src/lib/models/landing.js';
import { fieldName, pageTitle, t, toItem } from './text.js';

/**
 * @typedef {Parameters<typeof import('../indexer/html.js').page>[1]} Meta
 * @typedef {{city?: string, field?: string}} Page
 */

const site = config.name;

/**
 * The feed's address in the head, for feed readers and browsers to find it.
 * @param {string} title
 * @param {string} path
 */
function feedLink(title, path) {
	return `<link rel="alternate" type="application/atom+xml" title="${escape(title)}" href="${escape(config.url + path)}">`;
}

/**
 * Where the page is, for search results (schema.org BreadcrumbList).
 * @param {{name: string, path: string}[]} trail
 */
function breadcrumbs(trail) {
	return jsonLd({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map((step, i) => ({ '@type': 'ListItem', position: i + 1, name: step.name, item: config.url + step.path }))
	});
}

/** @param {ReturnType<typeof toItem> & {}} job */
function jobHtml(job) {
	const company = isCompanyKey(job.company) ? `<a href="/company/${escape(job.company)}">${escape(job.companyName)}</a>` : escape(job.companyName);
	const details = [company, escape(job.location), escape(job.workplace), job.date && `<time datetime="${escape(job.date)}">${escape(job.date.slice(0, 10))}</time>`];
	return `<li><a href="${escape(job.url)}">${escape(job.title)}</a> · ${details.filter(Boolean).join(' · ')}</li>`;
}

/**
 * A page of jobs: /in/berlin, /field/design, /in/berlin/design.
 * @param {Page} page
 * @param {any} data its snapshot file (indexer/landing.js)
 * @returns {Meta}
 */
export function landingMeta(page, data) {
	const cityName = String(data?.name || page.city || '');
	const title = pageTitle(page, cityName);
	const count = Number(data?.count) || 0;
	const path = landingPath(page);
	const feed = feedPath(page);
	const jobs = (Array.isArray(data?.jobs) ? data.jobs : []).map((/** @type {any} */ row) => toItem(row, data.names)).filter(Boolean);
	const description = `${title}: ${t('landing.intro', { count })}`;
	/** @type {{name: string, path: string, count: number}[]} */
	const related = page.city
		? (data?.fields || []).filter((/** @type {any} */ f) => f && !page.field).map((/** @type {any} */ f) => ({
				name: pageTitle({ city: page.city, field: f.slug }, cityName),
				path: landingPath({ city: page.city, field: f.slug }),
				count: Number(f.count) || 0
			}))
		: (data?.cities || []).map((/** @type {any} */ c) => ({
				name: pageTitle({ city: c.slug, field: page.field }, String(c.name)),
				path: landingPath({ city: c.slug, field: page.field }),
				count: Number(c.count) || 0
			}));
	// Pieces from the file are checked like any address before they become links.
	const links = related.filter((r) => /^\/(in|field)\/[a-z0-9/-]+$/.test(r.path));
	const trail = [
		{ name: site, path: '/' },
		page.city ? { name: t('landing.cities'), path: '/in' } : { name: t('landing.fields'), path: '/field' },
		...(page.city && page.field ? [{ name: t('landing.city', { city: cityName }), path: landingPath({ city: page.city }) }] : []),
		{ name: title, path }
	];
	return {
		title: `${title} · ${site}`,
		description,
		url: config.url + path,
		head: [feedLink(title, feed), breadcrumbs(trail)].join('\n\t\t'),
		// Its own jobs, fetched while the app loads (the same file this page is made from).
		preload: [...config.snapshot.preload.page, landingFile(page)],
		body: [
			`<nav><a href="/in">${escape(t('landing.cities'))}</a> · <a href="/field">${escape(t('landing.fields'))}</a></nav>`,
			`<h1>${escape(title)}</h1>`,
			`<p>${escape(t('landing.intro', { count }))}</p>`,
			`<p><a href="${escape(explorerPath({ cityName: page.city ? cityName : '', field: page.field }))}">${escape(t('landing.explore'))}</a> · <a href="${escape(feed)}" type="application/atom+xml">${escape(t('landing.follow'))}</a></p>`,
			`<ol>${jobs.map(jobHtml).join('')}</ol>`,
			links.length
				? `<h2>${escape(t(page.city ? 'landing.byField' : 'landing.byCity'))}</h2><ul>${links
						.map((r) => `<li><a href="${escape(r.path)}">${escape(r.name)}</a> (${escape(t('landing.count', { count: r.count }))})</li>`)
						.join('')}</ul>`
				: ''
		].join('')
	};
}

/**
 * /in and /field: every city, every field.
 * @param {'cities' | 'fields'} kind
 * @param {any} index landing/index.json
 * @returns {Meta}
 */
export function indexMeta(kind, index) {
	const cities = kind === 'cities';
	const title = t(cities ? 'landing.cities' : 'landing.fields');
	const intro = t(cities ? 'landing.cities.intro' : 'landing.fields.intro');
	const path = cities ? '/in' : '/field';
	const items = (cities ? index?.cities : index?.fields) || [];
	const links = items
		.map((/** @type {any} */ item) => {
			const page = cities ? { city: item.slug } : { field: item.slug };
			return { name: cities ? String(item.name) : fieldName(page), path: landingPath(page), count: Number(item.count) || 0 };
		})
		.filter((/** @type {{path: string}} */ l) => /^\/(in|field)\/[a-z0-9-]+$/.test(l.path));
	return {
		title: `${title} · ${site}`,
		description: intro,
		url: config.url + path,
		head: [feedLink(t('landing.newest'), feedPath({})), breadcrumbs([{ name: site, path: '/' }, { name: title, path }])].join('\n\t\t'),
		preload: [...config.snapshot.preload.page, indexFile()],
		body: `<nav><a href="/in">${escape(t('landing.cities'))}</a> · <a href="/field">${escape(t('landing.fields'))}</a></nav><h1>${escape(title)}</h1><p>${escape(intro)}</p><ul>${links
			.map((/** @type {any} */ l) => `<li><a href="${escape(l.path)}">${escape(l.name)}</a> (${escape(t('landing.count', { count: l.count }))})</li>`)
			.join('')}</ul>`
	};
}

/** When the snapshot cannot be read: a page for people (the app starts), kept out of results. @returns {Meta} */
export function unavailableMeta(/** @type {string} */ path) {
	return { title: site, description: t('landing.unavailable'), url: config.url + path, body: `<p>${escape(t('landing.unavailable'))}</p>`, noindex: true };
}
