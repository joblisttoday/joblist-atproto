import blocklist from '#lib/data/blocklist.json' with { type: 'json' };

/**
 * What joblist does not show: records from blocked accounts (by DID, which a
 * handle change does not escape), and records pointing to blocked domains
 * (spam, scams). The records stay in their authors' repositories; joblist
 * only leaves them out. Edited in data/blocklist.json.
 * @typedef {{did: string, value: Record<string, any>}} AnyRecord
 */

const list = /** @type {{accounts: string[], domains: string[]}} */ (blocklist);
const accounts = new Set(list.accounts);
const domains = list.domains.map((d) => d.toLowerCase());

/** @param {unknown} url */
function blockedLink(url) {
	if (typeof url !== 'string' || !url) return false;
	let host;
	try {
		host = new URL(url.includes('://') ? url : `https://${url}`).hostname.toLowerCase();
	} catch {
		return false;
	}
	return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

/**
 * Whether joblist shows a record.
 * @param {AnyRecord} record
 */
export function allowed(record) {
	if (accounts.has(record.did)) return false;
	const v = record.value || {};
	return ![v.url, v.jobBoard?.url, v.apply?.url, v.company].some(blockedLink);
}
