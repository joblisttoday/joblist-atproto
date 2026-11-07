/**
 * The site's own pages, for search engines and link previews: the home, the
 * company and list indexes, each profile, and plain shells for the app's
 * pages (saved searches, sign in…), so that every page that exists answers
 * with a page and anything else with a real 404 (wrangler.jsonc: 404-page).
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
	['/saved', en['saved.title']],
	['/signin', en['signin.title']],
	['/me', en['nav.me']],
	['/add', en['form.company.title']],
	['/jobs/new', en['post.title']],
	['/lists/new', en['list.new']],
	['/tools', config.name]
];

/** @param {string} path */
const url = (path) => config.url + (path === '/' ? '' : path);

/**
 * @param {{
 *   companies: {key: string, name: string}[],
 *   lists: {name: string, path: string, count: number}[],
 *   profiles: {handle: string, lists: {name: string, path: string}[]}[],
 *   jobCounts: Map<string, number>,
 *   jobTotal: number
 * }} site
 * @returns {SitePage[]}
 */
export function sitePages({ companies, lists, profiles, jobCounts, jobTotal }) {
	const welcome = en['explore.welcome'].replace('{companies}', companies.length.toLocaleString('en'));
	const hiring = [...companies].sort((a, b) => (jobCounts.get(b.key) || 0) - (jobCounts.get(a.key) || 0));
	/** @type {SitePage[]} */
	const pages = [
		{
			path: '/',
			listed: true,
			meta: {
				title: `${config.name} · ${jobTotal.toLocaleString('en')} open jobs`,
				description: welcome,
				url: url('/'),
				body: `<h1>${escape(config.name)}</h1><p>${escape(welcome)}</p><p><a href="/companies">${escape(en['companies.title'])}</a> · <a href="/lists">${escape(en['nav.lists'])}</a></p>`,
				preload: config.snapshot.preload.explore
			}
		},
		// The explorer at another address: the home is the page to show in results.
		{ path: '/jobs', listed: false, meta: { title: config.name, description: welcome, url: url('/'), body: '', preload: config.snapshot.preload.explore } },
		{
			path: '/companies',
			listed: true,
			meta: {
				title: `${en['companies.title']} · ${config.name}`,
				description: en['companies.intro'],
				url: url('/companies'),
				body: `<h1>${escape(en['companies.title'])}</h1><p>${escape(en['companies.intro'])}</p><ul>${hiring
					.map((c) => {
						const open = jobCounts.get(c.key);
						return `<li><a href="/company/${escape(c.key)}">${escape(c.name)}</a>${open ? ` (${open} open jobs)` : ''}</li>`;
					})
					.join('')}</ul>`,
				preload: config.snapshot.preload.counts
			}
		},
		{
			path: '/lists',
			listed: true,
			meta: {
				title: `${en['nav.lists']} · ${config.name}`,
				description: en['home.intro'],
				url: url('/lists'),
				body: `<h1>${escape(en['home.title'])}</h1><p>${escape(en['home.intro'])}</p><ul>${lists
					.map((l) => `<li><a href="${escape(l.path)}">${escape(l.name)}</a> (${l.count} companies)</li>`)
					.join('')}</ul>`,
				preload: config.snapshot.preload.counts
			}
		},
		...profiles.map((p) => ({
			path: `/${p.handle}`,
			listed: true,
			meta: {
				title: `@${p.handle} · ${config.name}`,
				description: `Lists of companies by @${p.handle} on ${config.name}.`,
				url: url(`/${p.handle}`),
				body: `<h1>@${escape(p.handle)}</h1><ul>${p.lists.map((l) => `<li><a href="${escape(l.path)}">${escape(l.name)}</a></li>`).join('')}</ul>`,
				preload: config.snapshot.preload.counts
			}
		})),
		...appPages.map(([path, title]) => ({
			path,
			listed: false,
			meta: { title: `${title} · ${config.name}`, description: welcome, url: url(path), body: '', noindex: true }
		}))
	];
	return pages;
}

/** The page for addresses that exist nowhere: the app still starts on it (newer companies, lists). */
export function notFoundPage() {
	return { title: `${en['notFound.title']} · ${config.name}`, description: en['notFound.text'], url: config.url, body: `<h1>${escape(en['notFound.title'])}</h1><p>${escape(en['notFound.text'])}</p>`, noindex: true };
}
