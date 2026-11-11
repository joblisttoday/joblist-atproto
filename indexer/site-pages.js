/**
 * The site's own pages, for search engines and link previews: the home, the explorers,
 * and plain shells for the app's pages (saved searches, sign in…), so that every page that
 * exists answers with a page and anything else with a real 404 (wrangler.jsonc: 404-page).
 * Written with the app's build (indexer/site.js), from no index: they say what joblist is,
 * not its numbers, and never get old.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { escape } from './html.js';
import { t } from '../worker/text.js';

/**
 * @typedef {{path: string, meta: Parameters<typeof import('./html.js').page>[1], listed: boolean}} SitePage
 *   listed: in the sitemap.
 */

/** The app's pages for people (their own data, forms): shells, kept out of search results. */
const appPages = [
	['/me/searches', en['me.searches.title']],
	['/me/organizations', en['kept.title']],
	['/me/organization', en['kept.title']],
	['/me/lists', en['me.lists.title']],
	['/me/lists/saved', en['marks.saved']],
	['/me/lists/applied', en['marks.applied']],
	['/me/lists/hidden', en['marks.hidden']],
	['/signin', en['signin.title']],
	['/menu', en['nav.menu']],
	['/menu/language', en['about.language']],
	['/menu/collections', en['collections.transfer']],
	['/menu/outbox', en['outbox.title']],
	['/me', en['nav.me']],
	['/add', en['form.company.title']],
	['/jobs/new', en['post.title']],
	['/tools', config.name],
	['/apps', en['apps.title']]
];

/** @param {string} path */
const url = (path) => config.url + (path === '/' ? '' : path);

/** @returns {SitePage[]} */
export function sitePages() {
	const welcome = en['home.lead'];
	const ways = `<p><a href="/jobs">${escape(en['saved.explore'])}</a> · <a href="/companies">${escape(en['companies.title'])}</a> · <a href="/in">${escape(t('landing.cities'))}</a> · <a href="/field">${escape(t('landing.fields'))}</a></p>`;
	/** @type {SitePage[]} */
	const pages = [
		{
			path: '/',
			listed: true,
			meta: { title: `${config.name} · ${en['home.heading']}`, description: welcome, url: url('/'), body: `<h1>${escape(config.name)}</h1><p>${escape(welcome)}</p>${ways}` }
		},
		{
			path: '/jobs',
			listed: true,
			meta: {
				title: `${en['nav.jobs']} · ${config.name}`,
				description: welcome,
				url: url('/jobs'),
				body: `<h1>${escape(en['nav.jobs'])}</h1><p>${escape(welcome)}</p>`,
				preload: config.snapshot.preload.explore
			}
		},
		{
			path: '/companies',
			listed: true,
			meta: {
				title: `${en['companies.title']} · ${config.name}`,
				description: en['companies.intro'],
				url: url('/companies'),
				body: `<h1>${escape(en['companies.title'])}</h1><p>${escape(en['companies.intro'])}</p>`,
				preload: config.snapshot.preload.counts
			}
		},
		{
			path: '/stats',
			listed: true,
			meta: { title: `${en['stats.title']} · ${config.name}`, description: en['stats.intro'], url: url('/stats'), body: `<h1>${escape(en['stats.title'])}</h1><p>${escape(en['stats.intro'])}</p>` }
		},
		...appPages.map(([path, title]) => ({
			path,
			listed: false,
			meta: { title: `${title} · ${config.name}`, description: welcome, url: url(path), body: '', noindex: true }
		}))
	];
	return pages;
}

/**
 * The app's page for addresses with one page per thing, answered with it (and 200) for any
 * of them by rewrites (_redirects, indexer/site.js); the app shows the thing. A domain or a
 * handle (/{domain}, /{handle}/…): an organization, an account, or what a browser finds of a
 * domain. A job posted on atproto (/job/…). No canonical address: the app knows each one's.
 * @returns {{path: string, rules: string[], meta: Parameters<typeof import('./html.js').page>[1]}[]}
 */
export function thingPages() {
	return [
		{ path: '/_page/job', rules: ['/job/*'], meta: { title: config.name, description: en['home.lead'], body: '' } },
		{ path: '/_page/domain', rules: [], meta: { title: config.name, description: en['companies.intro'], body: '', preload: config.snapshot.preload.company } }
	];
}

/** The page for addresses that exist nowhere: the app still starts on it (newer companies, lists). */
export function notFoundPage() {
	return { title: `${en['notFound.title']} · ${config.name}`, description: en['notFound.text'], url: config.url, body: `<h1>${escape(en['notFound.title'])}</h1><p>${escape(en['notFound.text'])}</p>`, noindex: true };
}
