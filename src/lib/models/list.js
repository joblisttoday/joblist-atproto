/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{
 *   uri: string,
 *   did: string,
 *   rkey: string,
 *   name: string,
 *   description?: string,
 *   companies: string[],
 *   copiedFrom?: string,
 *   createdAt: string
 * }} List
 */

/**
 * @param {RepoRecord} record
 * @returns {List}
 */
export function toList(record) {
	const v = record.value;
	return {
		uri: record.uri,
		did: record.did,
		rkey: record.rkey,
		name: v.name || '',
		description: v.description,
		companies: Array.isArray(v.companies) ? v.companies : [],
		copiedFrom: v.copiedFrom,
		createdAt: v.createdAt || ''
	};
}

/**
 * A list record from form values.
 * @param {{name: string, description: string, companies: string[], copiedFrom?: string}} form
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
	return record;
}

/**
 * Parse an at:// URI.
 * @param {string} uri
 */
export function parseUri(uri) {
	const [did, collection, rkey] = uri.replace('at://', '').split('/');
	return { did, collection, rkey };
}
