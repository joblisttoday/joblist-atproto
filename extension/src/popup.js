import config from '../../src/lib/data/config.json' with { type: 'json' };
import providers from '../../src/lib/data/providers.json' with { type: 'json' };
import { glanceOf } from '../../src/lib/models/glance.js';
import { keyOf } from '../../src/lib/models/kept.js';
import { readPage } from '../../src/lib/models/page-read.js';
import { bluesky } from '../../src/lib/network/bluesky-account.js';
import { api } from './api.js';
import { collectPage } from './collect.js';
import { counts } from './counts.js';
import { change, keptNow } from './store.js';
import { locale, t } from './texts.js';

/**
 * The add-on's popup, on the website open: what it is (read in the page), whether joblist
 * knows it and its open jobs (at once from joblist's counts, then its newest jobs from its
 * small file, asked only now), its job board and social profiles; save and tag it (in this
 * browser), open it on joblist or suggest it. It shows something at once, and says what went
 * wrong rather than staying empty.
 * @typedef {import('../../src/lib/models/page-read.js').Read} Read
 * @typedef {{title: string, url: string, place: string}} Offer
 * @typedef {{state: 'asking'} | {state: 'in', name: string, jobs: number, offers: Offer[], gone: boolean, key: string} | {state: 'out'} | {state: 'offline'}} Known
 */

const NEWEST = 5;
const WAIT = 4000;

/**
 * An element, its attributes (on…: listeners) and children.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {...(Node | string | null | false | undefined)} children
 */
function h(tag, attrs = {}, ...children) {
	const el = document.createElement(tag);
	for (const [name, value] of Object.entries(attrs)) {
		if (value === undefined || value === null || value === false) continue;
		if (name.startsWith('on')) el.addEventListener(name.slice(2), value);
		else el.setAttribute(name, value === true ? '' : String(value));
	}
	for (const child of children) if (child) el.append(child);
	return el;
}

/** Opens a page in a new tab, and closes the popup. @param {string} url */
function open(url) {
	return (/** @type {Event} */ event) => {
		event.preventDefault();
		api.tabs.create({ url });
		window.close();
	};
}

/** A link that opens in a new tab. @param {string} url @param {Record<string, any>} attrs @param {...(Node | string)} children */
const link = (url, attrs, ...children) => h('a', { href: url, onclick: open(url), ...attrs }, ...children);

/** A joblist.today page. @param {string} path */
const site = (path) => `${config.url}${path}`;

/** Gives up waiting after a while. @template T @param {Promise<T>} promise @param {T} fallback @returns {Promise<T>} */
const within = (promise, fallback) => Promise.race([promise, new Promise((done) => setTimeout(() => done(fallback), WAIT))]);

/** Its small file: its name and newest jobs. @param {string} key @returns {Promise<Known>} */
async function companyFile(key) {
	try {
		const res = await fetch(`${config.snapshot.path}/${config.embed.dir}/${encodeURIComponent(key)}.json`);
		if (res.status === 404) return { state: 'out' };
		if (!res.ok) return { state: 'offline' };
		const file = await res.json();
		const jobs = Array.isArray(file.jobs) ? file.jobs : [];
		// One offer posted for several places is one line, with its places (as joblist counts it).
		/** @type {Map<string, Offer>} */
		const offers = new Map();
		for (const job of jobs) {
			const title = String(job.t || '').trim();
			const place = String(job.l || '').trim();
			const same = offers.get(title.toLowerCase());
			if (same) {
				if (place && !same.place.includes(place)) same.place = same.place ? `${same.place} · ${place}` : place;
			} else offers.set(title.toLowerCase(), { title, url: String(job.u || ''), place });
		}
		return { state: 'in', key, name: String(file.name || ''), jobs: offers.size, gone: Boolean(file.gone), offers: [...offers.values()].slice(0, NEWEST) };
	} catch {
		return { state: 'offline' };
	}
}

/** The add form, filled in with what the page says. @param {Read} read */
function suggestUrl(read) {
	const params = new URLSearchParams({ url: read.link, name: read.name });
	if (read.boards[0]) params.set('board', read.boards[0].url);
	if (read.description) params.set('description', read.description);
	for (const social of read.socials) params.append('link', social.url);
	return site(`/add?${params}`);
}

/** The tab the popup is for: the active one (or ?tab=… to try it in a tab). */
async function currentTab() {
	const asked = Number(new URLSearchParams(location.search).get('tab'));
	if (asked) return api.tabs.get(asked);
	const [tab] = await api.tabs.query({ active: true, currentWindow: true });
	return tab;
}

/** What the page has; a page the add-on may not read (the browser's own) gives only its address. @param {any} tab */
async function collect(tab) {
	const fallback = { url: tab.url || '', title: tab.title || '', metas: {}, links: [] };
	try {
		const [result] = await within(api.scripting.executeScript({ target: { tabId: tab.id }, func: collectPage }), [{ result: null }]);
		return result?.result || fallback;
	} catch {
		return fallback;
	}
}

const app = /** @type {HTMLElement} */ (document.getElementById('app'));
document.documentElement.lang = locale;

/** @param {string} text */
const say = (text) => app.replaceChildren(h('p', { class: 'muted' }, text), h('footer', {}, link(site('/me/organizations'), {}, t('yours'))));

async function start() {
	say(t('reading'));
	const tab = await currentTab();
	if (!tab) return say(t('notPage'));
	const read = readPage(await collect(tab));
	if (!read) return say(t('notPage'));
	let list = await keptNow();
	// At once, from joblist's counts (as the button): known, and how many jobs.
	const glance = glanceOf(tab.url || read.link, await within(counts(), { offers: {}, known: [] }), list);
	/** @type {Known} */
	let found = glance?.known ? { state: 'in', key: glance.key, name: '', jobs: glance.jobs, offers: [], gone: false } : { state: 'asking' };

	// Kept by the domain joblist knows it by (gitlab.com for about.gitlab.com), else its link.
	const keptLink = () => (found.state === 'in' ? `https://${found.key}` : read.link);
	const item = () => list.find((k) => k.url === read.link || k.url === keptLink() || (read.key && keyOf(k.url) === read.key));

	function render() {
		if (!read) return;
		const kept = item();
		const tags = kept?.tags || [];
		const name = found.state === 'in' && found.name ? found.name : read.name;
		const page = found.state === 'in' ? site(`/company/${found.key}`) : '';
		const status =
			found.state === 'in'
				? link(page, { class: 'status', 'data-in': true }, h('span', {}, t('in')), h('b', {}, found.gone ? t('gone') : found.jobs ? t('jobs', { count: found.jobs }) : t('noJobs')))
				: h('p', { class: 'status' }, h('span', {}, t(found.state === 'asking' ? 'asking' : found.state === 'offline' ? 'offline' : 'out')));
		const offers =
			found.state === 'in' && found.offers.length
				? h(
						'ul',
						{ class: 'offers' },
						...found.offers.map((o) => h('li', {}, link(`${page}#${new URLSearchParams({ [config.jobs.jobParam]: o.url })}`, {}, o.title), o.place ? h('small', {}, o.place) : null)),
						found.jobs > found.offers.length ? h('li', {}, link(page, { class: 'more' }, t('allJobs', { count: found.jobs }))) : null
					)
				: null;
		const board = read.boards[0];
		const tagInput = h('input', {
			type: 'text',
			placeholder: t('addTag'),
			'aria-label': t('addTag'),
			enterkeyhint: 'done',
			onkeydown: async (/** @type {KeyboardEvent} */ e) => {
				const input = /** @type {HTMLInputElement} */ (e.target);
				if ((e.key !== 'Enter' && e.key !== ',') || !input.value.trim()) return;
				e.preventDefault();
				await save([...tags, input.value]);
			}
		});
		/** @type {(Node | null)[]} */
		const parts = [
			h('header', {}, h('h1', {}, name), h('small', {}, read.link.replace(/^https?:\/\/(www\.)?/, ''))),
			read.description ? h('p', { class: 'about' }, read.description) : null,
			status,
			offers,
			h(
				'dl',
				{},
				h('dt', {}, t('board')),
				h('dd', {}, board ? link(board.url, {}, `${providers.find((p) => p.id === board.provider)?.name || board.provider} · ${board.id}`) : h('span', { class: 'muted' }, t('noBoard'))),
				h('dt', {}, t('links')),
				h('dd', {}, read.socials.length ? h('span', {}, ...read.socials.flatMap((s, i) => [i ? ' · ' : '', link(s.url, {}, s.name)])) : h('span', { class: 'muted' }, t('noLinks')))
			),
			h(
				'div',
				{ class: 'tags', role: 'group', 'aria-label': t('tags') },
				...tags.map((tag) => h('span', { class: 'tag' }, tag, h('button', { type: 'button', 'aria-label': t('removeTag', { tag }), onclick: () => save(tags.filter((x) => x !== tag)) }, '×'))),
				tagInput
			),
			h(
				'div',
				{ class: 'actions' },
				h('button', { type: 'button', 'aria-pressed': kept ? 'true' : 'false', onclick: () => (kept ? forget() : save(tags)) }, kept ? t('saved') : t('save')),
				found.state === 'in' ? link(page, { class: 'primary' }, t('open')) : link(suggestUrl(read), { class: 'primary' }, t('suggest'))
			),
			found.state === 'in' ? h('p', { class: 'more-actions' }, link(site(`/add?key=${encodeURIComponent(found.key)}`), {}, t('edit'))) : null,
			h('footer', {}, h('small', {}, t('private')), link(site('/me/organizations'), {}, t('yours')))
		];
		app.replaceChildren(...parts.filter((part) => part !== null));
	}

	/** Keeps it, its tags kept or changed. @param {string[]} tags */
	async function save(tags) {
		const at = new Date().toISOString();
		const kept = item();
		await change(kept ? { op: 'tags', url: kept.url, tags, at } : { op: 'keep', url: keptLink(), name: found.state === 'in' && found.name ? found.name : read?.name || '', tags, at });
		list = await keptNow();
		render();
		/** @type {HTMLInputElement | null} */ (app.querySelector('.tags input'))?.focus();
	}
	async function forget() {
		const kept = item();
		if (!kept) return;
		await change({ op: 'forget', url: kept.url, at: new Date().toISOString() });
		list = await keptNow();
		render();
	}

	render();
	// Asked only now that the popup is open: its newest jobs, and whether its domain is a Bluesky handle.
	const keys = read.key ? [...new Set([found.state === 'in' ? found.key : '', read.key, read.key.split('.').slice(1).join('.')])].filter((k) => k.includes('.')) : [];
	const [answers, account] = await Promise.all([Promise.all(keys.map(companyFile)), read.key ? bluesky(read.key) : Promise.resolve(null)]);
	const counted = found.state === 'in' ? found.jobs : 0;
	found = answers.find((a) => a.state === 'in') || answers.find((a) => a.state === 'offline') || { state: 'out' };
	// The number joblist shows (each offer once), as the button says.
	if (found.state === 'in' && counted) found.jobs = counted;
	if (account && !read.socials.some((s) => s.id === 'bluesky')) read.socials.unshift({ id: 'bluesky', name: 'Bluesky', url: `https://bsky.app/profile/${account.handle}` });
	render();
}

start().catch((err) => say(`${t('failed')} (${err instanceof Error ? err.message : String(err)})`));
