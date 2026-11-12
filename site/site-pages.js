/**
 * The site's own pages, for search engines and link previews: the home, the jobs, and plain
 * shells for the app's pages (saved searches, sign in…), so that every page that exists
 * answers with a page; anything else (an organization's /{domain}, a job's /job/…) gets
 * 404.html, on which the app starts and shows it (GitHub Pages). Written with the app's
 * build (site/site.js): they say what joblist is, and never get old.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { escape } from './html.js';

/**
 * @typedef {{path: string, meta: Parameters<typeof import('./html.js').page>[1], listed: boolean}} SitePage
 *   listed: in the sitemap.
 */

/** The app's pages for people (their own data, forms): shells, kept out of search results. */
const appPages = [
	['/following', en['nav.following']],
	['/companies', en['nav.companies']],
	['/explore/list', en['curated.title']],
	['/explore/organization', en['nav.explore']],
	['/jobs/saved', en['marks.saved']],
	['/jobs/applied', en['marks.applied']],
	['/jobs/hidden', en['marks.hidden']],
	['/signin', en['signin.title']],
	['/menu', en['nav.menu']],
	['/menu/accounts', en['accounts.title']],
	['/menu/language', en['about.language']],
	['/menu/collections', en['collections.transfer']],
	['/menu/outbox', en['outbox.title']],
	['/tools', config.name],
	['/menu/apps', en['apps.title']]
];

/** @param {string} path */
const url = (path) => config.url + (path === '/' ? '' : path);

/** @returns {SitePage[]} */
export function sitePages() {
	const welcome = en['site.description'];
	/** @type {SitePage[]} */
	const pages = [
		{
			path: '/',
			listed: true,
			meta: { title: `${config.name} · ${en['home.heading']}`, description: welcome, url: url('/'), body: `<h1>${escape(config.name)}</h1><p>${escape(welcome)}</p>` }
		},
		// The jobs of the organizations followed in a browser: nothing to index.
		{
			path: '/jobs',
			listed: false,
			meta: { title: `${en['nav.jobs']} · ${config.name}`, description: welcome, url: url('/jobs'), body: '', noindex: true }
		},
		...appPages.map(([path, title]) => ({
			path,
			listed: false,
			meta: { title: `${title} · ${config.name}`, description: welcome, url: url(path), body: '', noindex: true }
		}))
	];
	return pages;
}

/** Every other address: the app starts on it, and shows an organization (/{domain}), a job (/job/…), or not found. */
export function notFoundPage() {
	return { title: `${en['notFound.title']} · ${config.name}`, description: en['notFound.text'], url: config.url, body: `<h1>${escape(en['notFound.title'])}</h1><p>${escape(en['notFound.text'])}</p>`, noindex: true };
}
