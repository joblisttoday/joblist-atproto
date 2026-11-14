/**
 * The site's own pages, for search engines and link previews: the home, so it answers with
 * what joblist is, and the app's own (/signin, /settings), so they answer
 * 200, not for search results; anything else (an organization's /{domain}, a job's /job/…) gets 404.html,
 * on which the app starts and shows it (GitHub Pages). Written with the app's build
 * (site/site.js).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { escape } from './html.js';

/**
 * @typedef {{path: string, meta: Parameters<typeof import('./html.js').page>[1], listed: boolean}} SitePage
 *   listed: in the sitemap.
 */

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
			meta: { title: config.name, description: welcome, url: url('/'), body: `<h1>${escape(config.name)}</h1><p>${escape(welcome)}</p>` }
		}
	];
	for (const [path, key] of [
		['/signin', 'signin.title'],
		['/settings', 'nav.settings']
	]) {
		const title = `${en[/** @type {keyof typeof en} */ (key)]} · ${config.name}`;
		pages.push({ path, listed: false, meta: { title, description: welcome, url: url(path), body: `<h1>${escape(title)}</h1><p>${escape(welcome)}</p>`, noindex: true } });
	}
	return pages;
}

/** Every other address: the app starts on it, and shows an organization (/{domain}), a job (/job/…), or not found. */
export function notFoundPage() {
	return { title: `${en['notFound.title']} · ${config.name}`, description: en['notFound.text'], url: config.url, body: `<h1>${escape(en['notFound.title'])}</h1><p>${escape(en['notFound.text'])}</p>`, noindex: true };
}
