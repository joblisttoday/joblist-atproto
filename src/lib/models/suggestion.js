/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{
 *   uri: string,
 *   did: string,
 *   rkey: string,
 *   list: string,
 *   company: string,
 *   note?: string,
 *   createdAt: string
 * }} Suggestion
 */

/**
 * @param {RepoRecord} record
 * @returns {Suggestion}
 */
export function toSuggestion(record) {
	const v = record.value;
	return {
		uri: record.uri,
		did: record.did,
		rkey: record.rkey,
		list: String(v.list || ''),
		company: String(v.company || ''),
		note: v.note,
		createdAt: String(v.createdAt || '')
	};
}

/**
 * A suggestion record: a company for someone else's list.
 * @param {{list: string, company: string, note?: string}} form
 * @param {string} [now]
 */
export function toRecord({ list, company, note }, now = new Date().toISOString()) {
	/** @type {Record<string, any>} */
	const record = { $type: 'today.joblist.suggestion', list, company, createdAt: now };
	if (note?.trim()) record.note = note.trim();
	return record;
}
