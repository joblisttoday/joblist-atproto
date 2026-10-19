import { detectBoard, isProviderUrl } from '#lib/ats/detect.js';
import { toDomain } from './company.js';

/**
 * Turn whatever was pasted, shared or sent by the bookmarklet
 * (a company website, a job board or a job ad) into a company to add.
 *
 * @typedef {{provider: string, id: string}} Board
 * @typedef {{link: string, name: string, board: string}} PasteInput
 * @typedef {{
 *   url: string,
 *   key: string,
 *   name: string,
 *   board: Board | null,
 *   careersUrl: string,
 *   guessed: boolean
 * }} Pasted
 */

const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/i;
const TRAILING = /[.,;:!?)\]}>'"»]+$/;
/** Looks like a bare domain: "acme.org", "acme.org/jobs". */
const BARE_DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i;
/** Subdomains of a company's careers or about site, not the company itself. */
const CAREERS_HOST = /^(jobs|careers|career|karriere|join|work|apply|hiring|about)\./i;
/** Paths of a careers page on the company's own site. */
const CAREERS_PATH = /career|job|join|karriere|stellen|emploi|recrut|hiring|vacanc|work-with-us/i;

/**
 * The first link in a text, e.g. "Look at this https://acme.org/jobs!" → https://acme.org/jobs.
 * A bare domain also counts ("acme.org").
 * @param {string | null | undefined} text
 */
export function firstUrl(text) {
	const value = (text || '').trim();
	const found = value.match(URL_IN_TEXT);
	if (found) return found[0].replace(TRAILING, '');
	if (BARE_DOMAIN.test(value)) return `https://${value}`;
	return '';
}

/**
 * What the add page was given in its query: ?url, ?name, ?board from links and
 * the bookmarklet; ?title, ?text, ?url from the share target (some apps put the
 * link in the text).
 * @param {{get: (name: string) => string | null}} params
 * @returns {PasteInput}
 */
export function readParams(params) {
	const url = params.get('url') || '';
	const text = params.get('text') || '';
	const title = params.get('title') || '';
	const link = firstUrl(url) || firstUrl(text) || firstUrl(title);
	// Something that is not a link, e.g. a company name typed in a search.
	const typed = link ? '' : [url, title, text].map((s) => s.trim()).find(Boolean) || '';
	return {
		link,
		name: (params.get('name') || typed).trim(),
		board: firstUrl(params.get('board'))
	};
}

/**
 * Whether the add page was given something to start from.
 * @param {{has: (name: string) => boolean}} params
 */
export function hasInput(params) {
	return ['url', 'name', 'board', 'text', 'title'].some((p) => params.has(p));
}

/**
 * "acme-labs.co.uk" → "Acme Labs"
 * @param {string} domain
 */
export function guessName(domain) {
	const parts = domain.replace(CAREERS_HOST, '').split('.');
	// the label before the public suffix (co.uk, com.au…)
	const short = parts.length > 2 && (parts.at(-2) || '').length <= 3 ? parts.at(-3) : parts.at(-2);
	return prettyId(short || parts[0] || '');
}

/**
 * A board id as a name: "hugging-face" → "Hugging Face".
 * @param {string} id
 */
export function prettyId(id) {
	return id
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/**
 * The company website for a link on its own site: the bare origin,
 * without a careers subdomain.
 * @param {URL} url
 */
function websiteOf(url) {
	return `https://${url.hostname.replace(/^www\./, '').replace(CAREERS_HOST, '')}`;
}

/**
 * @param {PasteInput} input
 * @returns {Pasted}
 */
export function parsePaste({ link, name, board }) {
	/** @type {Pasted} */
	const out = { url: '', key: '', name: name || '', board: null, careersUrl: '', guessed: !name };
	let url = null;
	try {
		url = link ? new URL(link) : null;
	} catch {
		url = null;
	}
	if (url) {
		out.board = detectBoard(url.href);
		if (!out.board && isProviderUrl(url.href)) {
			out.careersUrl = url.href;
		} else if (!out.board) {
			out.url = websiteOf(url);
			if (url.hostname.match(CAREERS_HOST) || CAREERS_PATH.test(url.pathname)) out.careersUrl = url.href;
		}
	}
	out.board ??= board ? detectBoard(board) : null;
	if (out.board) out.careersUrl = '';
	out.key = toDomain(out.url);
	out.name ||= out.key ? guessName(out.key) : out.board ? prettyId(out.board.id) : '';
	return out;
}

/**
 * A company already on joblist for this website or job board.
 * @param {Map<string, import('./company.js').Company>} companies
 * @param {Pasted} pasted
 */
export function findCompany(companies, { key, board }) {
	if (key && companies.has(key)) return companies.get(key) || null;
	// blog.acme.org → acme.org
	const parent = key.split('.').slice(1).join('.');
	if (parent.includes('.') && companies.has(parent)) return companies.get(parent) || null;
	if (!board) return null;
	const id = board.id.toLowerCase();
	for (const company of companies.values()) {
		const b = company.jobBoard;
		if (b?.provider === board.provider && b.id?.toLowerCase() === id) return company;
	}
	return null;
}

/**
 * Form values to fill in from what was pasted.
 * @param {Pasted} pasted
 * @param {string} [boardName] the name the job board gives the company
 */
export function toPrefill(pasted, boardName = '') {
	return {
		url: pasted.url,
		// the board's own spelling beats a name guessed from a domain or an id
		name: boardName && pasted.guessed ? boardName : pasted.name,
		provider: pasted.board?.provider || '',
		boardId: pasted.board?.id || '',
		careersUrl: pasted.careersUrl
	};
}

/**
 * Fill the empty fields of a company form; never overwrite what is there.
 * @template {{url: string, name: string, provider: string, boardId: string, careersUrl: string}} F
 * @param {F} form
 * @param {Partial<ReturnType<typeof toPrefill>>} prefill
 * @returns {F}
 */
export function withPrefill(form, prefill) {
	const out = { ...form };
	if (!out.url.trim() && prefill.url) out.url = prefill.url;
	if (!out.name.trim() && prefill.name) out.name = prefill.name;
	const hasBoard = out.provider || out.careersUrl.trim();
	if (!hasBoard && prefill.provider && prefill.boardId) {
		out.provider = prefill.provider;
		out.boardId = prefill.boardId;
	} else if (!hasBoard && prefill.careersUrl) {
		out.careersUrl = prefill.careersUrl;
	}
	return out;
}

/**
 * A job board link given as the careers page becomes the job board.
 * @template {{provider: string, boardId: string, careersUrl: string}} F
 * @param {F} form
 * @returns {F}
 */
export function boardFromCareers(form) {
	const board = !form.provider && form.careersUrl.trim() ? detectBoard(form.careersUrl.trim()) : null;
	return board ? { ...form, provider: board.provider, boardId: board.id, careersUrl: '' } : form;
}
