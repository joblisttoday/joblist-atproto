import config from '../../src/lib/data/config.json' with { type: 'json' };
import providers from '../../src/lib/data/providers.json' with { type: 'json' };
import { keyOf } from '../../src/lib/models/kept.js';
import { readPage } from '../../src/lib/models/page-read.js';
import { bluesky } from '../../src/lib/network/bluesky-account.js';
import { api } from './api.js';
import { collectPage } from './collect.js';
import { getJobs } from '../../src/lib/ats/index.js';
import { filterJobs, newestFirst } from '../../src/lib/models/job.js';
import { change, keptNow } from './store.js';
import { locale, t } from './texts.js';

/**
 * The add-on's popup, on the website open: what it is (read in the page), its job board and
 * its open jobs (read live from the board, asked only now), its social profiles; save and tag
 * it (in this browser, with its board), open its page on joblist. joblist keeps no list of
 * organizations: nothing is asked about the site but its own board and its Bluesky handle.
 * It shows something at once, and says what went wrong rather than staying empty.
 * @typedef {import('../../src/lib/models/page-read.js').Read} Read
 * @typedef {{title: string, url: string, place: string}} Offer
 * @typedef {{state: 'none'} | {state: 'asking'} | {state: 'read', jobs: number, matching: number | null, offers: Offer[]} | {state: 'offline'}} Jobs
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

/**
 * Its board's open jobs, read now: how many offers, the newest few (one offer posted for
 * several places is one line, with its places, as joblist counts it).
 * @param {{provider: string, id: string}} board @param {string} key
 * @returns {Promise<Jobs>}
 */
async function boardJobs(board, key) {
	try {
		const jobs = await getJobs(/** @type {any} */ ({ key, jobBoard: board }));
		newestFirst(jobs);
		// Your saved searches (copied from joblist.today, sync.js): how many of its jobs match one.
		const { searches = [] } = await api.storage.local.get('searches');
		const matching = Array.isArray(searches) && searches.length ? filterJobs(jobs, { query: '', where: '', remote: '', any: searches }, new Map()).length : null;
		/** @type {Map<string, Offer>} */
		const offers = new Map();
		for (const job of jobs) {
			const title = String(job.title || '').trim();
			const place = String(job.location || '').trim();
			const same = offers.get(title.toLowerCase());
			if (same) {
				if (place && !same.place.includes(place)) same.place = same.place ? `${same.place} · ${place}` : place;
			} else offers.set(title.toLowerCase(), { title, url: job.url, place });
		}
		return { state: 'read', jobs: offers.size, matching, offers: [...offers.values()].slice(0, NEWEST) };
	} catch {
		return { state: 'offline' };
	}
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
const say = (text) => app.replaceChildren(h('p', { class: 'muted' }, text), h('footer', {}, link(site('/'), {}, t('yours'))));

async function start() {
	say(t('reading'));
	const tab = await currentTab();
	if (!tab) return say(t('notPage'));
	const read = readPage(await collect(tab));
	if (!read) return say(t('notPage'));
	let list = await keptNow();
	const board = read.boards[0];
	/** @type {Jobs} */
	let found = board ? { state: 'asking' } : { state: 'none' };

	const item = () => list.find((k) => k.url === read.link || (read.key && keyOf(k.url) === read.key));

	function render() {
		if (!read) return;
		const kept = item();
		const tags = kept?.tags || [];
		const boardName = board ? `${providers.find((p) => p.id === board.provider)?.name || board.provider} · ${board.id}` : '';
		const status = h(
			'p',
			{ class: 'status', 'data-in': found.state === 'read' || undefined },
			h('span', {}, found.state === 'read' ? (found.jobs ? t('jobs', { count: found.jobs }) : t('noJobs')) : t(found.state === 'asking' ? 'asking' : found.state === 'offline' ? 'offline' : 'noBoard')),
			found.state === 'read' && found.matching !== null ? h('strong', {}, ` · ${t('matching', { count: found.matching })}`) : null
		);
		const offers =
			found.state === 'read' && found.offers.length
				? h('ul', { class: 'offers' }, ...found.offers.map((o) => h('li', {}, link(o.url, {}, o.title), o.place ? h('small', {}, o.place) : null)))
				: null;
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
		// Where to go from here: its careers page, its job board, its page on joblist (its domain's).
		const joblistPage = read.key ? site(`/${read.key}`) : site(`/explore/organization#${new URLSearchParams({ url: read.link })}`);
		/** @type {[string, string][]} */
		const ways = [
			[read.careers && read.careers !== board?.url ? read.careers : '', t('careersPage')],
			[board?.url || '', t('board')]
		];
		const go = ways.filter(([url]) => url);
		/** @type {(Node | null)[]} */
		const parts = [
			h('header', {}, h('h1', {}, read.name), h('small', {}, read.link.replace(/^https?:\/\/(www\.)?/, ''))),
			read.description ? h('p', { class: 'about' }, read.description) : null,
			status,
			go.length ? h('nav', { class: 'go', 'aria-label': t('go') }, ...go.map(([url, label]) => link(url, {}, `${label} ↗`))) : null,
			offers,
			h(
				'dl',
				{},
				h('dt', {}, t('board')),
				h('dd', {}, board ? link(board.url, {}, boardName) : h('span', { class: 'muted' }, t('noBoard'))),
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
				link(joblistPage, { class: 'primary' }, t('open'))
			),
			h('footer', {}, h('small', {}, t('private')), link(site('/'), {}, t('yours')))
		];
		// Drawn again when the board answers: what is being typed in the tag field stays.
		const typing = /** @type {HTMLInputElement | null} */ (app.querySelector('.tags input'));
		const typed = typing?.value || '';
		const focused = typing !== null && document.activeElement === typing;
		app.replaceChildren(...parts.filter((part) => part !== null));
		/** @type {HTMLInputElement} */ (tagInput).value = typed;
		if (focused) tagInput.focus();
	}

	/** Keeps it (with its board), its tags kept or changed. @param {string[]} tags */
	async function save(tags) {
		const at = new Date().toISOString();
		const kept = item();
		const url = read?.key ? `https://${read.key}` : read?.link || '';
		await change(kept ? { op: 'tags', url: kept.url, tags, at } : { op: 'keep', url, name: read?.name || '', tags, at, ...(board ? { board: { provider: board.provider, id: board.id } } : {}) });
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
	// Asked only now that the popup is open: its board's jobs, and whether its domain is a Bluesky handle.
	const [jobs, account] = await Promise.all([
		board ? within(boardJobs(board, read.key || board.id), /** @type {Jobs} */ ({ state: 'offline' })) : Promise.resolve(found),
		read.key ? bluesky(read.key) : Promise.resolve(null)
	]);
	found = jobs;
	if (account && !read.socials.some((s) => s.id === 'bluesky')) read.socials.unshift({ id: 'bluesky', name: 'Bluesky', url: `https://bsky.app/profile/${account.handle}` });
	render();
}

start().catch((err) => say(`${t('failed')} (${err instanceof Error ? err.message : String(err)})`));
