/**
 * The site's own pages, for search engines and link previews: the home, the
 * company and list indexes, each profile, and plain shells for the app's
 * pages (saved searches, sign in…), so that every page that exists answers
 * with a page and anything else with a real 404 (wrangler.jsonc: 404-page).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { escape } from './html.js';
import { linkList } from './place-links.js';
import { t } from '../worker/text.js';

/**
 * @typedef {{path: string, meta: Parameters<typeof import('./html.js').page>[1], listed: boolean, updated?: string}} SitePage
 *   listed: in the sitemap; updated: when it last changed, for the sitemap.
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
	['/lists/new', en['list.new']],
	['/lists/shared', en['list.shared.title']],
	['/tools', config.name]
];

/** A profile's tabs after its lists (src/lib/data/profile-tabs.json): their path and title. */
const profileTabs = [
	['jobs', en['profile.jobs']],
	['companies', en['profile.companies']]
];

/** @param {string} path */
const url = (path) => config.url + (path === '/' ? '' : path);

/**
 * @param {{
 *   companies: {key: string, name: string}[],
 *   lists: {name: string, path: string, count: number, updated?: string}[],
 *   profiles: {handle: string, lists: {name: string, path: string, updated?: string}[]}[],
 *   jobCounts: Map<string, number>,
 *   jobTotal: number,
 *   updated?: string,
 *   places?: {cities: import('./place-links.js').PlaceLink[], fields: import('./place-links.js').PlaceLink[]}
 * }} site
 *   updated: when the newest job was first seen; places: the pages per city and field to link to
 * @returns {SitePage[]}
 */
export function sitePages({ companies, lists, profiles, jobCounts, jobTotal, updated, places = { cities: [], fields: [] } }) {
	/** @param {{updated?: string}[]} items */
	const newest = (items) => items.map((i) => i.updated || '').reduce((a, b) => (b > a ? b : a), '');
	// What joblist is, in numbers: "28,294 open jobs at 361 organizations. Open jobs read straight from…"
	const hiringNow = companies.filter((c) => (jobCounts.get(c.key) || 0) > 0).length;
	const welcome = `${t('jobs.countAt', { count: jobTotal, companies: hiringNow })}. ${en['home.lead']}`;
	const hiring = [...companies].sort((a, b) => (jobCounts.get(b.key) || 0) - (jobCounts.get(a.key) || 0));
	/** @type {SitePage[]} */
	const pages = [
		{
			path: '/',
			listed: true,
			updated,
			meta: {
				title: `${config.name} · ${t('jobs.count', { count: jobTotal })}`,
				description: welcome,
				url: url('/'),
				body: `<h1>${escape(config.name)}</h1><p>${escape(welcome)}</p><p><a href="/jobs">${escape(en['saved.explore'])}</a> · <a href="/companies">${escape(en['companies.title'])}</a> · <a href="/lists">${escape(en['nav.lists'])}</a> · <a href="/in">${escape(t('landing.cities'))}</a> · <a href="/field">${escape(t('landing.fields'))}</a></p>${linkList(t('landing.cities'), places.cities)}${linkList(t('landing.fields'), places.fields)}`
			}
		},
		{
			path: '/jobs',
			listed: true,
			updated,
			meta: {
				title: `${t('jobs.count', { count: jobTotal })} · ${config.name}`,
				description: welcome,
				url: url('/jobs'),
				body: `<h1>${escape(t('jobs.count', { count: jobTotal }))}</h1><p>${escape(welcome)}</p>`,
				preload: config.snapshot.preload.explore
			}
		},
		{
			path: '/companies',
			listed: true,
			updated,
			meta: {
				title: `${en['companies.title']} · ${config.name}`,
				description: en['companies.intro'],
				url: url('/companies'),
				body: `<h1>${escape(en['companies.title'])}</h1><p>${escape(en['companies.intro'])}</p><ul>${hiring
					.map((c) => {
						const open = jobCounts.get(c.key);
						return `<li><a href="/company/${escape(c.key)}">${escape(c.name)}</a>${open ? ` (${escape(t('jobs.count', { count: open }))})` : ''}</li>`;
					})
					.join('')}</ul>`,
				preload: config.snapshot.preload.counts
			}
		},
		{
			path: '/lists',
			listed: true,
			updated: newest(lists),
			meta: {
				title: `${en['nav.lists']} · ${config.name}`,
				description: en['home.intro'],
				url: url('/lists'),
				body: `<h1>${escape(en['home.title'])}</h1><p>${escape(en['home.intro'])}</p><ul>${lists
					.map((l) => `<li><a href="${escape(l.path)}">${escape(l.name)}</a> (${escape(t('list.companies', { count: l.count }))})</li>`)
					.join('')}</ul>`,
				preload: config.snapshot.preload.counts
			}
		},
		{
			path: '/stats',
			listed: true,
			updated,
			meta: { title: `${en['stats.title']} · ${config.name}`, description: en['stats.intro'], url: url('/stats'), body: `<h1>${escape(en['stats.title'])}</h1><p>${escape(en['stats.intro'])}</p>` }
		},
		...profiles.flatMap((p) => [
			{
				path: `/${p.handle}`,
				listed: true,
				updated: newest(p.lists),
				meta: {
					title: `@${p.handle} · ${config.name}`,
					description: `Lists of companies by @${p.handle} on ${config.name}.`,
					url: url(`/${p.handle}`),
					body: `<h1>@${escape(p.handle)}</h1><ul>${p.lists.map((l) => `<li><a href="${escape(l.path)}">${escape(l.name)}</a></li>`).join('')}</ul>`,
					preload: config.snapshot.preload.counts
				}
			},
			// Its other tabs: a page to open and to preview, kept out of search results (the lists say who it is).
			...profileTabs.map(([tab, title]) => ({
				path: `/${p.handle}/${tab}`,
				listed: false,
				meta: {
					title: `@${p.handle} · ${title} · ${config.name}`,
					description: `${title}: @${p.handle} on ${config.name}.`,
					url: url(`/${p.handle}/${tab}`),
					body: `<h1>@${escape(p.handle)}</h1>`,
					noindex: true
				}
			}))
		]),
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
