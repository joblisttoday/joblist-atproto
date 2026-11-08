/**
 * <joblist-jobs company="example.com" query="legal" where="Berlin" remote="remote" search lang="en" limit="20">
 * <joblist-jobs list="did:plc:…/3my7…" search>
 *
 * A company's open jobs, or a list's (its organizations', taking turns), from joblist.today,
 * to show on any website:
 *   <script type="module" src="https://joblist.today/embed/joblist-jobs.js"></script>
 *   <joblist-jobs company="example.com"></joblist-jobs>
 *   <joblist-jobs list="did:plc:…/3my7…"></joblist-jobs>  (a list: its author's DID and its key, as its page gives them)
 * Only some of them: query (words of the title), where (the place), remote="remote".
 * search: with a box to search them. Each list can be followed as a feed.
 *
 * It reads the company's jobs as of the last snapshot (one small file), and
 * links each job to where it is applied for. Its look follows the page: set
 * --joblist-font, --joblist-fg, --joblist-muted, --joblist-line and
 * --joblist-accent on it to change it. It never runs anything from the data:
 * every text is set as text, and only http(s) links are kept.
 */
const settingsUrl = new URL('./settings.json', import.meta.url);
/** @type {Promise<any> | null} */
let settings = null;
const loadSettings = () => (settings ??= fetch(settingsUrl).then((res) => res.json()));

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
 * Whether a job is one of those asked for: every word in its title, the place in its location.
 * @param {any} job
 * @param {{words: string[], where: string, remote: boolean}} filter
 */
function matches(job, { words, where, remote }) {
	const title = String(job.t || '').toLowerCase();
	return words.every((w) => title.includes(w)) && (!where || String(job.l || '').toLowerCase().includes(where)) && (!remote || job.r === 'remote');
}

/** @param {string} text */
const wordsOf = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * A list's jobs, its organizations taking turns: each one's `per` newest, then the next
 * (as joblist's own lists show them: src/lib/models/job.js spread()).
 * @param {any[]} jobs newest first
 * @param {number} per
 */
function spread(jobs, per) {
	if (!per) return jobs;
	/** @type {Map<string, number>} */
	const counted = new Map();
	/** @type {any[][]} */
	const rounds = [];
	for (const job of jobs) {
		const n = counted.get(job.c) || 0;
		counted.set(job.c, n + 1);
		(rounds[Math.floor(n / per)] ??= []).push(job);
	}
	return rounds.flat();
}

/**
 * A list as an embed names it: "did:…/rkey", or its at:// address. null when it is neither.
 * @param {string} text
 */
function listOf(text) {
	const [, did, rkey] = text.trim().match(/^(?:at:\/\/)?(did:[a-z0-9]+:[A-Za-z0-9._:%-]+)\/(?:today\.joblist\.list\/)?([A-Za-z0-9._:~-]{1,512})$/) || [];
	return did && rkey ? { did, rkey } : null;
}

/** A path segment, its colons kept (a DID's: allowed in a path). @param {string} part */
const segment = (part) => encodeURIComponent(part).replaceAll('%3A', ':');

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
	static observedAttributes = ['company', 'list', 'lang', 'limit', 'query', 'where', 'remote', 'search'];
	/** What is typed in its search box. */
	typed = '';
	/** @type {{key: string, data: Promise<any>} | null} the company's or the list's file, read once */
	file = null;

	connectedCallback() {
		if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [sheet];
		this.render();
	}

	attributeChangedCallback() {
		if (this.shadowRoot) this.render();
	}

	async render() {
		const root = /** @type {ShadowRoot} */ (this.shadowRoot);
		const list = listOf(this.getAttribute('list') || '');
		const key = list ? `${list.did}/${list.rkey}` : (this.getAttribute('company') || '').trim().toLowerCase();
		const s = await loadSettings();
		const asked = (this.getAttribute('lang') || document.documentElement.lang || navigator.language || 'en').slice(0, 2).toLowerCase();
		// A language the browser does not know (a typo in lang) falls back to English.
		const lang = /^[a-z]{2}$/.test(asked) && Intl.DateTimeFormat.supportedLocalesOf(asked).length ? asked : 'en';
		const text = s.strings[lang] || s.strings.en;
		const limit = Math.max(1, Number(this.getAttribute('limit')) || s.shown);
		if (this.file?.key !== key) {
			const url = list
				? `${s.snapshot}/${s.lists}/${segment(list.did)}/${segment(list.rkey)}.json`
				: /^[a-z0-9][a-z0-9.-]*$/.test(key)
					? `${s.snapshot}/${s.dir}/${key}.json`
					: '';
			const data = url
				? fetch(url)
						.then((res) => (res.ok ? res.json() : null))
						.catch(() => null)
				: Promise.resolve(null);
			this.file = { key, data };
		}
		const data = await this.file.data;
		if (!data) {
			root.replaceChildren(el('p', {}, [text.error]));
			return;
		}
		// Those asked for (and typed), followed as a feed and seen whole on the company's page.
		const query = (this.getAttribute('query') || '').trim();
		const where = (this.getAttribute('where') || '').trim();
		const remote = this.getAttribute('remote') === 'remote';
		const only = new URLSearchParams();
		const words = `${query} ${this.typed}`.trim();
		if (words) only.set('q', words);
		if (where) only.set('where', where);
		if (remote) only.set('remote', 'remote');
		const page = `${s.site}/${list ? `${segment(list.did)}/${segment(list.rkey)}` : `company/${key}`}${only.size ? `#${only}` : ''}`;
		const feed = list ? '' : only.size ? `${s.site}/feed/search.xml?${only}&company=${key}` : `${s.site}/feed/company/${key}.xml`;
		const filter = { words: wordsOf(`${query} ${this.typed}`), where: where.toLowerCase(), remote };
		const found = (Array.isArray(data.jobs) ? data.jobs : []).filter((/** @type {any} */ job) => matches(job, filter));
		const jobs = list ? spread(found, Number(s.spread) || 0) : found;
		/** @type {Record<string, string>} */
		const names = list && data.names && typeof data.names === 'object' ? data.names : {};
		const date = new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' });
		const items = jobs.slice(0, limit).flatMap((/** @type {any} */ job) => {
			const href = safeLink(job.u);
			if (!href || !job.t) return [];
			const when = Date.parse(job.p);
			const about = [list ? String(names[job.c] || job.c || '') : '', job.l, text.remote[job.r], Number.isFinite(when) ? date.format(when) : ''].filter(Boolean).join(' · ');
			return [el('li', {}, [el('a', { href, target: '_blank', rel: 'noopener' }, [el('strong', {}, [String(job.t)]), about ? el('small', {}, [about]) : ''])])];
		});
		const count = jobs.length === 1 ? text.countOne : fill(text.count, { count: jobs.length.toLocaleString(lang) });
		const shown = items.length ? el('ul', {}, items) : el('p', {}, [text.none]);
		const footer = el('p', {}, [
			jobs.length > items.length ? el('a', { href: page, target: '_blank', rel: 'noopener' }, [fill(text.more, { count })]) : count,
			...(feed ? [' · ', el('a', { href: feed, type: 'application/atom+xml', title: text.followHelp }, [text.follow])] : []),
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
		root.replaceChildren(el('h2', {}, [el('a', { href: page, target: '_blank', rel: 'noopener' }, [fill(list ? text.listTitle : text.title, { name: String(data.name || key) })])]), search, shown, footer);
	}
}

if (!customElements.get('joblist-jobs')) customElements.define('joblist-jobs', JoblistJobs);
