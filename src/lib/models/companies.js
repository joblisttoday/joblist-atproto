/**
 * The same company added twice (\"scale-ai\" and \"scale.com\"), found by their
 * shared job board: one company is kept, and the other's key leads to it.
 * Only companies nobody verified are merged: anyone can name any job board, and
 * proving one's own domain says nothing about a board, so a board alone must
 * never let one company take another's place. The one named by its domain is kept. Records stay as their authors wrote them.
 * @typedef {import('./company.js').Company} Company
 */

/** @param {Company} c */
const boardOf = (c) => (c.jobBoard?.provider && c.jobBoard?.id ? `${c.jobBoard.provider}:${c.jobBoard.id.toLowerCase()}` : '');

/**
 * The company to keep of two: the one named by a domain, else the first in
 * order; none when either is verified.
 * @param {Company} a @param {Company} b
 * @returns {Company | null}
 */
function preferred(a, b) {
	if (a.verified || b.verified) return null;
	return (Number(b.key.includes('.')) - Number(a.key.includes('.')) || a.key.localeCompare(b.key)) <= 0 ? a : b;
}

/**
 * Keys of companies that are another's twin, and the key kept for each.
 * @param {Iterable<Company>} companies
 * @returns {Map<string, string>}
 */
export function twins(companies) {
	/** @type {Map<string, Company>} */
	const kept = new Map();
	/** @type {Map<string, string>} */
	const aliases = new Map();
	for (const c of companies) {
		const board = boardOf(c);
		if (!board) continue;
		const other = kept.get(board);
		if (!other) {
			kept.set(board, c);
			continue;
		}
		const keep = preferred(other, c);
		if (!keep) continue;
		const drop = keep === other ? c : other;
		kept.set(board, keep);
		aliases.set(drop.key, keep.key);
	}
	// A key dropped after it was kept for another: lead both to the last kept.
	for (const [drop, keep] of aliases) {
		let to = keep;
		while (aliases.has(to)) to = /** @type {string} */ (aliases.get(to));
		aliases.set(drop, to);
	}
	return aliases;
}

/**
 * Companies by key, without twins when listed, and a twin's key giving the kept company.
 * @extends {Map<string, Company>}
 */
export class Companies extends Map {
	/** @param {Company[]} list */
	constructor(list) {
		const aliases = twins(list);
		super(list.filter((c) => !aliases.has(c.key)).map((c) => [c.key, c]));
		/** Twin keys and the key kept for each. */
		this.aliases = aliases;
	}

	/** @param {string} key */
	get(key) {
		return super.get(key) ?? super.get(this.aliases.get(key) ?? '');
	}

	/** @param {string} key */
	has(key) {
		return super.has(key) || this.aliases.has(key);
	}
}
