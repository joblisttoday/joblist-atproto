/**
 * Loose name matching, to tell a company's own links from a partner's.
 */

const LEGAL = /\b(gmbh|ag|se|kg|ug|inc|ltd|llc|co|corp|company|group|holding|sas|sa|bv|ab|oy|as|plc)\b/g;

/** @param {string} text */
export function normalize(text) {
	return (text || '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/&/g, 'and')
		.replace(LEGAL, '')
		.replace(/[^a-z0-9]/g, '');
}

/**
 * The part of a host name a company registers ('www2.acme.co.uk' → 'acme.co.uk').
 * @param {string} host
 */
export function siteOf(host) {
	const labels = host.toLowerCase().split('.');
	const keep = labels.length > 2 && ['co', 'com', 'org', 'net', 'ac', 'gov'].includes(labels.at(-2) || '') && labels.at(-1)?.length === 2 ? 3 : 2;
	return labels.slice(-keep).join('.');
}

/**
 * Whether an identifier (board id, domain label) belongs to one of the names.
 * @param {string} id
 * @param {string[]} names company name, record key, domain…
 */
export function matchesName(id, names) {
	const a = normalize(id);
	if (a.length < 2) return false;
	return names.map(normalize).some((b) => {
		if (b.length < 2) return false;
		if (a === b) return true;
		const [short, long] = a.length < b.length ? [a, b] : [b, a];
		return short.length >= 4 && long.startsWith(short);
	});
}
