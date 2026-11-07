/**
 * Web addresses written in plain text (a job's description), to show as links.
 * Only http(s) addresses become links; the rest stays text, never HTML.
 * @typedef {{text: string, href?: string}} TextPart
 */

const ADDRESS = /\bhttps?:\/\/[^\s<>"'`]+/gi;
const TRAILING = /[.,;:!?'"»”’]+$/;

/**
 * Where an address written in text ends: not on the sentence's punctuation,
 * nor on a closing bracket it did not open ("(see https://a.org/jobs)").
 * @param {string} found
 */
function trim(found) {
	let address = found.replace(TRAILING, '');
	for (const [open, close] of ['()', '[]']) {
		while (address.endsWith(close) && address.split(open).length < address.split(close).length) {
			address = address.slice(0, -1).replace(TRAILING, '');
		}
	}
	return address;
}

/** @param {string} address */
function safeHref(address) {
	try {
		const url = new URL(address);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Text cut into its plain parts and its web addresses.
 * @param {string} text
 * @returns {TextPart[]}
 */
export function textLinks(text) {
	/** @type {TextPart[]} */
	const parts = [];
	let at = 0;
	for (const match of text.matchAll(ADDRESS)) {
		const address = trim(match[0]);
		const href = safeHref(address);
		if (!href) continue;
		const start = /** @type {number} */ (match.index);
		if (start > at) parts.push({ text: text.slice(at, start) });
		parts.push({ text: address, href });
		at = start + address.length;
	}
	if (at < text.length) parts.push({ text: text.slice(at) });
	return parts;
}
