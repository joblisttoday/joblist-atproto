import { searchText } from './company.js';
import { findCompany, parsePaste } from './paste.js';

/**
 * What the list form starts from, says back while it is filled in, and saves.
 * @typedef {import('./list.js').List} List
 * @typedef {import('./company.js').Company} Company
 * @typedef {{name: string, description: string, companies: string[], copiedFrom?: string, open: boolean, hidden: string[]}} ListForm
 * @typedef {{name?: string, description?: string, companies?: string[], copiedFrom?: string, open?: boolean}} ListStart
 */

/**
 * The form for a list, or for a new one from what the page starts with (a copy, a company).
 * New lists are open to contributions; their author can still hide any.
 * @param {List | null} list
 * @param {ListStart} [start]
 * @returns {ListForm}
 */
export function toListForm(list, start = {}) {
	return {
		name: list?.name ?? start.name ?? '',
		description: list?.description ?? start.description ?? '',
		companies: [...(list?.companies ?? start.companies ?? [])],
		copiedFrom: list?.copiedFrom ?? start.copiedFrom ?? '',
		open: list?.open ?? start.open ?? true,
		hidden: [...(list?.hidden ?? [])]
	};
}

/**
 * Whether a kept draft is the list being made here: something written, and the same
 * list copied (when the page copies one). A company to add is added to it.
 * @param {ListForm | null} draft
 * @param {ListStart} start
 * @returns {draft is ListForm}
 */
export function listDraftApplies(draft, start) {
	if (!draft || !(draft.name.trim() || draft.description.trim() || draft.companies.length)) return false;
	return !start.copiedFrom || draft.copiedFrom === start.copiedFrom;
}

/**
 * The draft, with the companies the page starts with added at the end.
 * @param {ListForm} draft
 * @param {ListStart} start
 * @returns {ListForm}
 */
export function resumeDraft(draft, start) {
	const added = (start.copiedFrom ? [] : start.companies || []).filter((key) => !draft.companies.includes(key));
	return { ...draft, companies: [...draft.companies, ...added] };
}

/**
 * The list as it will show among others, while it is written: nothing before it has a name.
 * @param {ListForm} form
 * @param {string} did its author, when signed in
 * @returns {List | null}
 */
export function previewList(form, did) {
	const name = form.name.trim();
	if (!name) return null;
	return {
		uri: '',
		did,
		rkey: '',
		name,
		description: form.description.trim() || undefined,
		companies: [...new Set(form.companies)],
		open: form.open,
		hidden: [],
		createdAt: ''
	};
}

/**
 * Companies to add, matching every word typed: those whose name starts with it first,
 * then those with the most open jobs. The ones already in the list are left out.
 * @param {Iterable<Company>} companies
 * @param {string[]} chosen
 * @param {string} query
 * @param {Map<string, number>} jobs open jobs by company
 * @param {number} limit
 */
export function findCompanies(companies, chosen, query, jobs, limit) {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	// Nothing typed yet: the companies hiring most, to start from.
	if (!words.length) {
		return [...companies]
			.filter((c) => !chosen.includes(c.key) && jobs.get(c.key))
			.sort((a, b) => (jobs.get(b.key) || 0) - (jobs.get(a.key) || 0))
			.slice(0, limit);
	}
	const start = words.join(' ');
	const rank = (/** @type {Company} */ c) => (c.name.toLowerCase().startsWith(start) || c.key.startsWith(start) ? 0 : 1);
	return [...companies]
		.filter((c) => !chosen.includes(c.key) && words.every((w) => searchText(c).includes(w)))
		.sort((a, b) => rank(a) - rank(b) || (jobs.get(b.key) || 0) - (jobs.get(a.key) || 0) || a.name.localeCompare(b.name))
		.slice(0, limit);
}

/**
 * Websites, links to them or to their job boards, pasted at once (one a line, or separated by
 * spaces or commas): those on joblist and not in the list yet, and those to describe first.
 * Each once, in the order pasted.
 * @param {string} text
 * @param {Map<string, Company>} companies by key
 * @param {string[]} chosen the list's organizations
 * @returns {{found: Company[], missing: {key: string, link: string}[], already: number}}
 */
export function readPasted(text, companies, chosen) {
	/** @type {Map<string, Company>} */
	const found = new Map();
	/** @type {Map<string, {key: string, link: string}>} */
	const missing = new Map();
	let already = 0;
	for (const word of text.split(/[\s,;]+/)) {
		// A website, a link, a domain: something with a dot, never a name's words.
		if (!word.includes('.')) continue;
		const link = /^https?:\/\//i.test(word) ? word : `https://${word}`;
		const pasted = parsePaste({ link, name: '', board: '' });
		const company = findCompany(companies, pasted);
		if (company && chosen.includes(company.key)) already++;
		else if (company) found.set(company.key, company);
		else if (pasted.key || pasted.board) missing.set(pasted.key || link, { key: pasted.key, link });
	}
	return { found: [...found.values()], missing: [...missing.values()], already };
}

/**
 * The items with one moved to another place (kept in bounds).
 * @template T
 * @param {T[]} items
 * @param {number} from
 * @param {number} to
 */
export function moveItem(items, from, to) {
	if (from < 0 || from >= items.length || to < 0 || to >= items.length) return items;
	const out = [...items];
	const [item] = out.splice(from, 1);
	out.splice(to, 0, item);
	return out;
}
