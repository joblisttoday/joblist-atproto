/**
 * <joblist-jobs company="example.com" lang="en" limit="20">
 *
 * A company's open jobs, from joblist.today, to show on any website:
 *   <script type="module" src="https://joblist.today/embed/joblist-jobs.js"></script>
 *   <joblist-jobs company="example.com"></joblist-jobs>
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
`);

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
	static observedAttributes = ['company', 'lang', 'limit'];

	connectedCallback() {
		if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [sheet];
		this.render();
	}

	attributeChangedCallback() {
		if (this.shadowRoot) this.render();
	}

	async render() {
		const root = /** @type {ShadowRoot} */ (this.shadowRoot);
		const key = (this.getAttribute('company') || '').trim().toLowerCase();
		const s = await loadSettings();
		const asked = (this.getAttribute('lang') || document.documentElement.lang || navigator.language || 'en').slice(0, 2).toLowerCase();
		// A language the browser does not know (a typo in lang) falls back to English.
		const lang = /^[a-z]{2}$/.test(asked) && Intl.DateTimeFormat.supportedLocalesOf(asked).length ? asked : 'en';
		const text = s.strings[lang] || s.strings.en;
		const limit = Math.max(1, Number(this.getAttribute('limit')) || s.shown);
		/** @type {any} */
		let data = null;
		if (/^[a-z0-9][a-z0-9.-]*$/.test(key)) {
			try {
				const res = await fetch(`${s.snapshot}/${s.dir}/${key}.json`);
				data = res.ok ? await res.json() : null;
			} catch {
				// shown as not read
			}
		}
		if (!data) {
			root.replaceChildren(el('p', {}, [text.error]));
			return;
		}
		const page = `${s.site}/company/${key}`;
		const jobs = Array.isArray(data.jobs) ? data.jobs : [];
		const date = new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' });
		const items = jobs.slice(0, limit).flatMap((/** @type {any} */ job) => {
			const href = safeLink(job.u);
			if (!href || !job.t) return [];
			const when = Date.parse(job.p);
			const about = [job.l, text.remote[job.r], Number.isFinite(when) ? date.format(when) : ''].filter(Boolean).join(' · ');
			return [el('li', {}, [el('a', { href, target: '_blank', rel: 'noopener' }, [el('strong', {}, [String(job.t)]), about ? el('small', {}, [about]) : ''])])];
		});
		const count = jobs.length === 1 ? text.countOne : fill(text.count, { count: jobs.length.toLocaleString(lang) });
		root.replaceChildren(
			el('h2', {}, [el('a', { href: page, target: '_blank', rel: 'noopener' }, [fill(text.title, { name: String(data.name || key) })])]),
			items.length ? el('ul', {}, items) : el('p', {}, [text.none]),
			el('p', {}, [
				jobs.length > items.length ? el('a', { href: page, target: '_blank', rel: 'noopener' }, [fill(text.more, { count })]) : count,
				' · ',
				el('a', { href: s.site, target: '_blank', rel: 'noopener' }, [text.by])
			])
		);
	}
}

if (!customElements.get('joblist-jobs')) customElements.define('joblist-jobs', JoblistJobs);
