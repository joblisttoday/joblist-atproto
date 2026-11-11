import config from '#lib/data/config.json' with { type: 'json' };
import { detectBoard } from '#lib/ats/detect.js';
import { safeUrl } from './url.js';
import { ATPROTO, pickVersion, toDomain, toRecord, withScheme } from './company.js';
import { boardFromCareers } from './paste.js';

/**
 * What the company form says back while it is filled in, and what saving it does.
 * @typedef {import('./company.js').Company} Company
 * @typedef {import('./company.js').CompanyForm} CompanyForm
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 */

const { tagsMax, tagMax, linksMax } = config.companyForm;
/** A record key a page can be made of (see records.js), with a dot: a domain. */
const DOMAIN_KEY = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

/**
 * A tag as stored: lowercase, single spaces, no leading #, at most tagMax characters.
 * @param {string} text
 */
export function tagWord(text) {
	const word = text.trim().replace(/^#+/, '').replace(/\s+/g, ' ').toLowerCase();
	return Array.from(word).slice(0, tagMax).join('').trim();
}

/**
 * Typed tag text: the tags finished with a comma or a new line, and the word still being typed.
 * "food, coop, cli" → done ["food", "coop"], rest "cli".
 * @param {string} text
 */
export function splitTags(text) {
	const parts = text.split(/[,\n]/);
	const rest = /** @type {string} */ (parts.pop());
	return { done: parts.map(tagWord).filter(Boolean), rest };
}

/**
 * The tags with new ones added at the end, once each, up to the most a record holds.
 * @param {string[]} tags
 * @param {string[]} words
 */
export function addTags(tags, words) {
	const out = [...tags];
	for (const word of words.map(tagWord)) {
		if (word && !out.includes(word) && out.length < tagsMax) out.push(word);
	}
	return out;
}

/**
 * Tags other companies use, most used first, that start with (or contain) what is typed;
 * the ones already chosen are left out.
 * @param {Iterable<Company>} companies
 * @param {string[]} chosen
 * @param {string} typed
 * @param {number} limit
 */
export function popularTags(companies, chosen, typed, limit) {
	/** @type {Map<string, number>} */
	const counts = new Map();
	for (const company of companies) {
		for (const tag of new Set(company.tags)) counts.set(tag, (counts.get(tag) || 0) + 1);
	}
	const query = tagWord(typed);
	const rank = (/** @type {string} */ tag) => (!query ? 0 : tag.startsWith(query) ? 0 : 1);
	return [...counts]
		.filter(([tag]) => !chosen.includes(tag) && (!query || tag.includes(query)))
		.sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, limit)
		.map(([tag, count]) => ({ tag, count }));
}

/**
 * A link as typed: empty, a web link (with the site it goes to), or not one.
 * @param {string} text
 * @returns {{state: 'empty'} | {state: 'ok', url: string, host: string} | {state: 'invalid'}}
 */
export function readLink(text) {
	if (!text.trim()) return { state: 'empty' };
	const url = safeUrl(withScheme(text));
	try {
		const host = new URL(url).hostname.replace(/^www\./, '');
		if (host.includes('.')) return { state: 'ok', url, host };
	} catch {
		// not a link
	}
	return { state: 'invalid' };
}

/** Whether another link can be added. @param {string[]} links */
export const canAddLink = (links) => links.length < linksMax;

/**
 * The website typed, and what it makes: the company's key (its page) for a new
 * company, or that the company is already on joblist. An edited company keeps its key.
 * @param {string} url
 * @param {Map<string, Company>} companies
 * @param {string} [editing] the key of the company being edited
 * @returns {{state: 'empty' | 'invalid' | 'new' | 'exists' | 'kept', key: string}}
 */
export function readWebsite(url, companies, editing = '') {
	if (editing) return { state: 'kept', key: editing };
	if (!url.trim()) return { state: 'empty', key: '' };
	const key = toDomain(url);
	if (!DOMAIN_KEY.test(key)) return { state: 'invalid', key: '' };
	return { state: companies.has(key) ? 'exists' : 'new', key };
}

/**
 * A job board pasted whole in the board id field, or as the careers page:
 * "https://jobs.lever.co/acme" → {provider: 'lever', id: 'acme'}.
 * @param {string} text
 */
export function readBoardInput(text) {
	const value = text.trim();
	if (!/[/.]/.test(value)) return null;
	const board = detectBoard(value.includes('://') ? value : `https://${value}`);
	return board?.id ? board : null;
}

/** Parts of a company page that can be missing, in the order they are asked for. */
export const INVITED = /** @type {const} */ (['description', 'jobBoard', 'locations', 'tags']);

/**
 * What a company page lacks, to invite visitors to add it.
 * @param {Company} company
 * @returns {(typeof INVITED)[number][]}
 */
export function missingFields(company) {
	const has = {
		description: Boolean(company.description?.trim()),
		jobBoard: Boolean(company.jobBoard?.id || company.jobBoard?.url || company.jobBoard?.provider === ATPROTO),
		locations: company.locations.length > 0,
		tags: company.tags.length > 0
	};
	return INVITED.filter((field) => !has[field]);
}

/**
 * The company as it will look once saved, for the preview while the form is filled in.
 * @param {CompanyForm} form
 * @param {string} key
 * @returns {Company | null}
 */
export function previewCompany(form, key) {
	if (!key || !form.name.trim()) return null;
	const record = toRecord(boardFromCareers(form));
	const version = { did: '', rkey: key, uri: '', cid: '', value: record };
	return {
		key,
		name: record.name,
		url: record.url,
		description: record.description,
		kind: record.kind || '',
		tags: record.tags || [],
		locations: record.locations || [],
		jobBoard: record.jobBoard,
		links: record.links || [],
		verified: false,
		unchecked: false,
		editedAt: record.updatedAt,
		record: version,
		versions: [version]
	};
}

/**
 * The record to save as the signed-in person's own version: their first
 * description's date is kept, the edit time is now.
 * @param {CompanyForm} form
 * @param {Company | null} company the company edited (null for a new one)
 * @param {string} did the person saving
 * @param {string} [now]
 */
export function companyRecord(form, company, did, now) {
	const own = company?.versions.find((v) => v.did === did);
	const key = company ? company.key : toDomain(form.url);
	return { key, record: toRecord(boardFromCareers(form), own?.value.createdAt, now) };
}

/**
 * What saving does to the page: the person's version is the one shown, or
 * it stays in the history because the company's own version wins.
 * @param {Company | null} company
 * @param {string} handle the person saving
 * @returns {'own' | 'shown' | 'behindOwn'}
 */
export function saveOutcome(company, handle) {
	if (company && handle === company.key) return 'own';
	return company?.verified ? 'behindOwn' : 'shown';
}

/**
 * What deleting the person's version does to the page: the company leaves
 * joblist (it was the only version), another version is shown instead, or
 * nothing shown changes (another version was shown already).
 * @param {Company} company
 * @param {string} did
 * @param {Map<string, {handle: string}>} profiles
 * @returns {{outcome: 'gone'} | {outcome: 'replaced' | 'unchanged', next: RepoRecord}}
 */
export function afterDelete(company, did, profiles) {
	const rest = company.versions.filter((v) => v.did !== did);
	if (!rest.length) return { outcome: 'gone' };
	const next = pickVersion(rest, profiles);
	return { outcome: company.record.did === did ? 'replaced' : 'unchanged', next };
}

/**
 * A draft kept in this browser is for the company being added: the one with
 * the website (or the job board) pasted, or any when nothing was pasted.
 * @param {CompanyForm} draft
 * @param {{url?: string, provider?: string, boardId?: string}} pasted
 */
export function draftApplies(draft, { url = '', provider = '', boardId = '' }) {
	if (!draft.name.trim() && !draft.url.trim() && !draft.description.trim()) return false;
	if (url) return toDomain(draft.url) === toDomain(url);
	if (provider && boardId) return draft.provider === provider && draft.boardId.toLowerCase() === boardId.toLowerCase();
	return true;
}
