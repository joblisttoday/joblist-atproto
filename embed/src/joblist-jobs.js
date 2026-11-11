/**
 * <joblist-jobs board="greenhouse:acme" query="legal" where="Berlin" remote="remote" search lang="en" limit="20">
 * <joblist-jobs company="acme.org" search>
 *
 * An organization's open jobs, read live from its own job board, to show on any website:
 *   <script type="module" src="https://cdn.jsdelivr.net/gh/joblisttoday/joblist-atproto@main/embed/dist/joblist-jobs.js"></script>
 *   <joblist-jobs board="greenhouse:acme"></joblist-jobs>
 * board: its job board, as provider:id or its address (https://job-boards.greenhouse.io/acme);
 *   the visitor's browser reads it, as the organization's own site would: no joblist, no index.
 * company: its domain, when the board is not given: an index (joblist's, or index="…") says
 *   which board it has; its jobs are then read live, else shown as the index has them.
 * Only some of them: query (words of the title), where (the place), remote="remote".
 * search: with a box to search them.
 *
 * Built by scripts/build-embed.js (embed/dist), with joblist's job board readers and texts.
 * Its look follows the page: set --joblist-font, --joblist-fg, --joblist-muted,
 * --joblist-line and --joblist-accent on it to change it. It never runs anything from the
 * data: every text is set as text, and only http(s) links are kept.
 */
import providers from '../../src/lib/data/providers.json' with { type: 'json' };
import { detectBoard } from '../../src/lib/ats/detect.js';
import { getJobs } from '../../src/lib/ats/index.js';
import { boardName } from '../../src/lib/ats/board-check.js';
import { prettyId } from '../../src/lib/models/paste.js';

/**
 * Built in (scripts/build-embed.js): the index's address, joblist's address, how many shown,
 * and the texts in each language.
 * @type {{snapshot: string, dir: string, site: string, shown: number, strings: Record<string, any>}}
 */
const settings = __EMBED__;

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
	:host { display: block; font: inherit; font-family: var(--joblist-font, inherit); color: var(--joblist-fg, inherit); }
	h2 { margin: 0 0 0.5em; font-size: 1.15em; }
	a { color: inherit; }
	ul { margin: 0; padding: 0; list-style: none; }
	li { border-bottom: 1px solid var(--joblist-line, rgb(128 128 128 / 0.3)); }
	li a { display: block; padding: 0.6em 0; text-decoration: none; }
	li a:hover strong { text-decoration: underline; }
	strong { display: block; }
	small { display: block; color: var(--joblist-muted, rgb(128 128 128)); font-size: 0.85em; }
	p { margin: 0.75em 0 0; color: var(--joblist-muted, rgb(128 128 128)); font-size: 0.85em; }
	p a { color: var(--joblist-accent, inherit); }
	input { box-sizing: border-box; width: 100%; margin: 0 0 0.5em; padding: 0.5em 0.75em; font: inherit; color: inherit; background: transparent; border: 1px solid var(--joblist-line, rgb(128 128 128 / 0.6)); border-radius: 0.5em; }
`);

/**
 * @typedef {{title: string, url: string, location?: string, remote?: string, published?: string}} Shown
 * @typedef {{name: string, jobs: Shown[]} | null} Found
 */

/**
 * Whether a job is one of those asked for: every word in its title, the place in its location.
 * @param {Shown} job
 * @param {{words: string[], where: string, remote: boolean}} filter
 */
function matches(job, { words, where, remote }) {
	const title = job.title.toLowerCase();
	return words.every((w) => title.includes(w)) && (!where || String(job.location || '').toLowerCase().includes(where)) && (!remote || job.remote === 'remote');
}

/** @param {string} text */
const wordsOf = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);

/** @param {unknown} value */
function safeLink(value) {
	try {
		const url = new URL(String(value));
		return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
	} catch {
		return null;
	}
}

/**
 * A board as an embed names it: "greenhouse:acme", or its address. null when it is neither.
 * @param {string} text
 */
export function boardOf(text) {
	const value = text.trim();
	const [, provider, id] = value.match(/^([a-z]+):([^/\s]+)$/) || [];
	if (provider && id && providers.some((p) => p.id === provider)) return { provider, id };
	return value ? detectBoard(value) : null;
}

/** Its board's jobs, read now, the newest first (as joblist shows them). @param {{provider: string, id: string}} board @param {string} key @returns {Promise<Shown[]>} */
async function live(board, key) {
	const jobs = await getJobs(/** @type {any} */ ({ key, jobBoard: board }));
	const time = (/** @type {string | undefined} */ date) => Date.parse(date || '') || 0;
	return jobs
		.map((j) => ({ title: j.title, url: j.url, location: j.location, remote: j.remote, published: j.published }))
		.sort((a, b) => time(b.published) - time(a.published));
}

/**
 * What to show: the board given, read live; else the company's board as an index says,
 * read live, with the offers it posted itself; else the index's copy of its jobs.
 * @param {{board: {provider: string, id: string} | null, company: string, index: string}} asked
 * @returns {Promise<Found>}
 */
async function find({ board, company, index }) {
	if (board) {
		// The name its board gives (Greenhouse, Workable… say it), else its id as a name.
		const [name, jobs] = await Promise.all([boardName(board), live(board, board.id)]);
		return { name: name || prettyId(board.id), jobs };
	}
	if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(company)) return null;
	const file = await fetch(`${index}/${settings.dir}/${company}.json`)
		.then((res) => (res.ok ? res.json() : null))
		.catch(() => null);
	if (!file) return null;
	/** @type {Shown[]} */
	const copied = (Array.isArray(file.jobs) ? file.jobs : []).map((/** @type {any} */ j) => ({ title: String(j.t || ''), url: String(j.u || ''), location: j.l, remote: j.r, published: j.p, posted: Boolean(j.s) }));
	const known = file.board?.provider && file.board?.id ? { provider: String(file.board.provider), id: String(file.board.id) } : null;
	const fresh = known ? await live(known, company) : [];
	// Its board read now, and the offers it posted itself; the index's copy when the board said nothing.
	const jobs = fresh.length ? [...copied.filter((j) => /** @type {any} */ (j).posted), ...fresh] : copied;
	return { name: String(file.name || company), jobs };
}

/**
 * @param {string} tag
 * @param {Record<string, string>} [attributes]
 * @param {(Node | string)[]} [children]
 */
function el(tag, attributes = {}, children = []) {
	const node = document.createElement(tag);
	for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
	node.append(...children);
	return node;
}

/** @param {string} text @param {Record<string, string | number>} values */
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));

class JoblistJobs extends HTMLElement {
	static observedAttributes = ['board', 'company', 'index', 'lang', 'limit', 'query', 'where', 'remote', 'search'];
	/** What is typed in its search box. */
	typed = '';
	/** @type {{key: string, data: Promise<Found>} | null} what was found, asked once */
	found = null;

	connectedCallback() {
		if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [sheet];
		this.render();
	}

	attributeChangedCallback() {
		if (this.shadowRoot) this.render();
	}

	async render() {
		const root = /** @type {ShadowRoot} */ (this.shadowRoot);
		const s = settings;
		const board = boardOf(this.getAttribute('board') || '');
		const company = (this.getAttribute('company') || '').trim().toLowerCase();
		const index = (this.getAttribute('index') || s.snapshot).replace(/\/$/, '');
		const asked = (this.getAttribute('lang') || document.documentElement.lang || navigator.language || 'en').slice(0, 2).toLowerCase();
		// A language the browser does not know (a typo in lang) falls back to English.
		const lang = /^[a-z]{2}$/.test(asked) && Intl.DateTimeFormat.supportedLocalesOf(asked).length ? asked : 'en';
		const text = s.strings[lang] || s.strings.en;
		const limit = Math.max(1, Number(this.getAttribute('limit')) || s.shown);
		const key = board ? `${board.provider}:${board.id}` : `${index}|${company}`;
		if (this.found?.key !== key) this.found = { key, data: find({ board, company, index }) };
		const data = await this.found.data;
		if (!data) {
			root.replaceChildren(el('p', {}, [text.error]));
			return;
		}
		// Those asked for (and typed), seen whole on joblist when the company is known there.
		const query = (this.getAttribute('query') || '').trim();
		const where = (this.getAttribute('where') || '').trim();
		const remote = this.getAttribute('remote') === 'remote';
		const only = new URLSearchParams();
		const words = `${query} ${this.typed}`.trim();
		if (words) only.set('q', words);
		if (where) only.set('where', where);
		if (remote) only.set('remote', 'remote');
		const page = company ? `${s.site}/company/${company}${only.size ? `#${only}` : ''}` : '';
		const boardPage = board ? providers.find((p) => p.id === board.provider)?.board.replace('{id}', encodeURIComponent(board.id)) || '' : '';
		const whole = page || boardPage;
		const filter = { words: wordsOf(`${query} ${this.typed}`), where: where.toLowerCase(), remote };
		const jobs = data.jobs.filter((job) => job.title && matches(job, filter));
		const date = new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' });
		const items = jobs.slice(0, limit).flatMap((job) => {
			const href = safeLink(job.url);
			if (!href) return [];
			const when = Date.parse(job.published || '');
			const about = [job.location, text.remote[job.remote || ''], Number.isFinite(when) ? date.format(when) : ''].filter(Boolean).join(' · ');
			return [el('li', {}, [el('a', { href, target: '_blank', rel: 'noopener' }, [el('strong', {}, [job.title]), about ? el('small', {}, [about]) : ''])])];
		});
		const count = jobs.length === 1 ? text.countOne : fill(text.count, { count: jobs.length.toLocaleString(lang) });
		const shown = items.length ? el('ul', {}, items) : el('p', {}, [text.none]);
		const footer = el('p', {}, [
			jobs.length > items.length && whole ? el('a', { href: whole, target: '_blank', rel: 'noopener' }, [fill(text.more, { count })]) : count,
			' · ',
			el('a', { href: s.site, target: '_blank', rel: 'noopener' }, [text.by])
		]);
		// Typing changes the list only: the box keeps its focus and what is typed.
		const box = /** @type {HTMLInputElement | null} */ (root.querySelector('input'));
		if (box && this.hasAttribute('search')) {
			root.querySelector('ul, p:not(:last-child)')?.replaceWith(shown);
			root.lastElementChild?.replaceWith(footer);
			return;
		}
		const search = this.hasAttribute('search') ? el('input', { type: 'search', 'aria-label': text.search, placeholder: text.search }) : '';
		if (search instanceof HTMLInputElement)
			search.addEventListener('input', () => {
				this.typed = search.value;
				this.render();
			});
		const title = fill(text.title, { name: data.name || board?.id || company });
		root.replaceChildren(el('h2', {}, whole ? [el('a', { href: whole, target: '_blank', rel: 'noopener' }, [title])] : [title]), search, shown, footer);
	}
}

if (!customElements.get('joblist-jobs')) customElements.define('joblist-jobs', JoblistJobs);
