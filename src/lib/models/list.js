import config from '#lib/data/config.json' with { type: 'json' };
import { capRecord } from './limits.js';

/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {import('./suggestion.js').Suggestion} Suggestion
 * @typedef {{
 *   uri: string,
 *   did: string,
 *   rkey: string,
 *   name: string,
 *   description?: string,
 *   companies: string[],
 *   copiedFrom?: string,
 *   open: boolean,
 *   hidden: string[],
 *   createdAt: string
 * }} List
 * @typedef {{key: string, suggestion?: Suggestion}} Member
 */

/** The author of the lists kept on this device only (network/local-lists.svelte.js): no handle is so, it has no dot. */
export const LOCAL = 'local';

/**
 * @param {RepoRecord} record
 * @returns {List}
 */
export function toList(record) {
	const v = capRecord(config.collections.list, record.value);
	return {
		uri: record.uri,
		did: record.did,
		rkey: record.rkey,
		name: v.name || '',
		description: v.description,
		companies: Array.isArray(v.companies) ? v.companies : [],
		copiedFrom: v.copiedFrom,
		open: v.open === true,
		hidden: Array.isArray(v.hidden) ? v.hidden : [],
		createdAt: v.createdAt || ''
	};
}

/**
 * A list record from form values.
 * @param {{name: string, description: string, companies: string[], copiedFrom?: string, open?: boolean, hidden?: string[]}} form
 * @param {string} [createdAt]
 */
export function toRecord(form, createdAt) {
	/** @type {Record<string, any>} */
	const record = {
		$type: 'today.joblist.list',
		name: form.name.trim(),
		companies: [...new Set(form.companies)],
		createdAt: createdAt || new Date().toISOString()
	};
	if (form.description.trim()) record.description = form.description.trim();
	if (form.copiedFrom) record.copiedFrom = form.copiedFrom;
	if (form.open) record.open = true;
	if (form.hidden?.length) record.hidden = [...new Set(form.hidden)];
	return record;
}

/**
 * The companies of a list, with what others suggested for it.
 * Open lists include suggested companies at once (credited);
 * for other lists they wait for the author (pending).
 * Companies the author hid or dismissed are left out.
 * @param {List} list
 * @param {Suggestion[]} suggestions all known suggestions
 * @returns {{members: Member[], pending: Suggestion[]}}
 */
export function membership(list, suggestions) {
	const listed = new Set(list.companies);
	const hidden = new Set(list.hidden);
	/** @type {Map<string, Suggestion>} the first suggestion of each company */
	const suggested = new Map();
	const forList = suggestions
		.filter((s) => s.list === list.uri && s.did !== list.did)
		.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	for (const s of forList) {
		if (!listed.has(s.company) && !hidden.has(s.company) && !suggested.has(s.company)) suggested.set(s.company, s);
	}
	/** @type {Member[]} */
	const members = list.companies.map((key) => ({ key }));
	if (!list.open) return { members, pending: [...suggested.values()] };
	return { members: [...members, ...[...suggested.values()].map((s) => ({ key: s.company, suggestion: s }))], pending: [] };
}

/**
 * Parse an at:// URI.
 * @param {string} uri
 */
export function parseUri(uri) {
	const [did, collection, rkey] = uri.replace('at://', '').split('/');
	return { did, collection, rkey };
}

/**
 * Whether lists shown together need their author on each row: not when one person made them all.
 * @param {List[]} lists
 */
export function mixedAuthors(lists) {
	return new Set(lists.map((l) => l.did)).size > 1;
}
