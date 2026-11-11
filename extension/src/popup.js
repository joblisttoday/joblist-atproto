import config from '../../src/lib/data/config.json' with { type: 'json' };
import providers from '../../src/lib/data/providers.json' with { type: 'json' };
import { keyOf } from '../../src/lib/models/kept.js';
import { readPage } from '../../src/lib/models/page-read.js';
import { api } from './api.js';
import { collectPage } from './collect.js';
import { change, keptNow } from './store.js';

/**
 * The add-on's popup, on the website open: what it is (read in the page), whether joblist
 * knows it and its open jobs (one small file, asked only now), its job board and social
 * profiles; keep it and tag it (in this browser), or suggest it to joblist.
 * @typedef {import('../../src/lib/models/page-read.js').Read} Read
 * @typedef {{state: 'asking'} | {state: 'in', name: string, jobs: number, gone: boolean, key: string} | {state: 'out'} | {state: 'offline'}} Known
 */

/** The add-on's texts (extension.*), in the browser's language; built in by scripts/build-extension.js (env.d.ts). */
const MESSAGES = __MESSAGES__;
const locale = (navigator.language || 'en').slice(0, 2);
const messages = MESSAGES[locale] || MESSAGES.en;

/**
 * @param {string} key without "extension."
 * @param {Record<string, string | number>} [vars]
 */
function t(key, vars = {}) {
	const one = vars.count === 1 && messages[`extension.${key}.one`];
	let text = one || messages[`extension.${key}`] || MESSAGES.en[`extension.${key}`] || key;
	for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, typeof value === 'number' ? value.toLocaleString(locale) : value);
	return text;
}

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

/** A joblist.today page. @param {string} path */
const site = (path) => `${config.url}${path}`;

/** Asks joblist whether it knows the organization: its small file (its name, its open jobs). @param {Read} read */
async function known(read) {
	if (!read.key) return /** @type {Known} */ ({ state: 'out' });
	// acme.org, else the organization of a subdomain (careers.acme.org)
	const keys = [read.key, read.key.split('.').slice(1).join('.')].filter((k) => k.includes('.'));
	try {
		for (const key of keys) {
			const res = await fetch(`${config.snapshot.path}/${config.embed.dir}/${encodeURIComponent(key)}.json`);
			if (res.ok) {
				const file = await res.json();
				return /** @type {Known} */ ({ state: 'in', key, name: String(file.name || ''), jobs: Array.isArray(file.jobs) ? file.jobs.length : 0, gone: Boolean(file.gone) });
			}
			if (res.status !== 404) return /** @type {Known} */ ({ state: 'offline' });
		}
		return /** @type {Known} */ ({ state: 'out' });
	} catch {
		return /** @type {Known} */ ({ state: 'offline' });
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
	try {
		const [result] = await api.scripting.executeScript({ target: { tabId: tab.id }, func: collectPage });
		if (result?.result) return result.result;
	} catch {
		// not readable: its address and title only
	}
	return { url: tab.url || '', title: tab.title || '', metas: {}, links: [] };
}

const app = /** @type {HTMLElement} */ (document.getElementById('app'));
document.documentElement.lang = MESSAGES[locale] ? locale : 'en';

async function start() {
	const tab = await currentTab();
	const read = tab ? readPage(await collect(tab)) : null;
	if (!read) {
		app.replaceChildren(h('p', { class: 'muted' }, t('notPage')), h('footer', {}, h('a', { href: site('/me/organizations'), onclick: open(site('/me/organizations')) }, t('yours'))));
		return;
	}
	/** @type {Known} */
	let found = { state: 'asking' };
	let list = await keptNow();
	// Kept by the domain joblist knows it by (gitlab.com for about.gitlab.com), else its link.
	const link = () => (found.state === 'in' ? `https://${found.key}` : read.link);
	const item = () => list.find((k) => k.url === read.link || k.url === link() || (read.key && keyOf(k.url) === read.key));

	function render() {
		const kept = item();
		const tags = kept?.tags || [];
		const name = found.state === 'in' && found.name ? found.name : read?.name || '';
		if (!read) return;
		const status =
			found.state === 'in'
				? h('a', { class: 'status', 'data-in': true, href: site(`/company/${found.key}`), onclick: open(site(`/company/${found.key}`)) }, h('span', {}, t('in')), h('b', {}, found.gone ? t('gone') : t('jobs', { count: found.jobs })))
				: h('p', { class: 'status' }, h('span', {}, t(found.state === 'asking' ? 'asking' : found.state === 'offline' ? 'offline' : 'out')));
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
				await save([...tags, input.value], true);
			}
		});
		app.replaceChildren(
			...[
				h('header', {}, h('h1', {}, name), h('small', {}, read.link.replace(/^https?:\/\/(www\.)?/, ''))),
				read.description ? h('p', { class: 'about' }, read.description) : null,
				status,
				h(
					'dl',
					{},
					h('dt', {}, t('board')),
					h('dd', {}, board ? h('a', { href: board.url, onclick: open(board.url) }, `${providers.find((p) => p.id === board.provider)?.name || board.provider} · ${board.id}`) : h('span', { class: 'muted' }, t('noBoard'))),
					h('dt', {}, t('links')),
					h(
						'dd',
						{},
						read.socials.length
							? h('span', {}, ...read.socials.flatMap((s, i) => [i ? ' · ' : '', h('a', { href: s.url, onclick: open(s.url) }, s.name)]))
							: h('span', { class: 'muted' }, t('noLinks'))
					)
				),
				h(
					'div',
					{ class: 'tags', role: 'group', 'aria-label': t('tags') },
					...tags.map((tag) => h('span', { class: 'tag' }, tag, h('button', { type: 'button', 'aria-label': t('removeTag', { tag }), onclick: () => save(tags.filter((x) => x !== tag), true) }, '×'))),
					tagInput
				),
				h(
					'div',
					{ class: 'actions' },
					h('button', { type: 'button', 'aria-pressed': kept ? 'true' : 'false', onclick: () => (kept ? forget() : save(tags, false)) }, kept ? t('saved') : t('save')),
					found.state === 'in'
						? h('a', { class: 'primary', href: site(`/company/${found.key}`), onclick: open(site(`/company/${found.key}`)) }, t('open'))
						: h('a', { class: 'primary', href: suggestUrl(read), onclick: open(suggestUrl(read)) }, t('suggest'))
				),
				h('footer', {}, h('small', {}, t('private')), h('a', { href: site('/me/organizations'), onclick: open(site('/me/organizations')) }, t('yours')))
			].filter((node) => node !== null)
		);
		if (document.activeElement === document.body && tags.length) tagInput.focus();
	}

	/** Keeps it (tags kept or changed). @param {string[]} tags @param {boolean} focusTags */
	async function save(tags, focusTags) {
		if (!read) return;
		const at = new Date().toISOString();
		const kept = item();
		await change(kept ? { op: 'tags', url: kept.url, tags, at } : { op: 'keep', url: link(), name: found.state === 'in' ? found.name : read.name, tags, at });
		list = await keptNow();
		render();
		if (focusTags) /** @type {HTMLInputElement | null} */ (app.querySelector('.tags input'))?.focus();
	}
	async function forget() {
		const kept = item();
		if (!kept) return;
		await change({ op: 'forget', url: kept.url, at: new Date().toISOString() });
		list = await keptNow();
		render();
	}

	render();
	found = await known(read);
	render();
}

start();
