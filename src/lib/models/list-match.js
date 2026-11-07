import config from '#lib/data/config.json' with { type: 'json' };

/**
 * Lists a posted job could show in: lists show their companies' open jobs,
 * so a job shows in a list once its company is a member.
 * @typedef {import('./list.js').List} List
 * @typedef {import('./company.js').Company} Company
 * @typedef {import('./company.js').Location} Location
 */

/** @param {string} text */
const fold = (text) =>
	text
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.trim();

/**
 * Where and in what field a job is: the city of each of its places, its company's
 * places and tags, folded (lowercase, without accents).
 * @param {Location[]} locations the job's places
 * @param {Company} [company]
 */
export function jobTerms(locations, company) {
	const cities = [...locations, ...(company?.locations || [])].map((l) => (l.name || '').split(',')[0]);
	return new Set([...cities, ...(company?.tags || [])].map(fold).filter((term) => term.length >= config.lists.related.minTermLength));
}

/**
 * The terms of one company: its tags and the cities of its places.
 * @param {Company} [company]
 */
function companyTerms(company) {
	return company ? jobTerms([], company) : new Set();
}

/**
 * Whether a text says a term as a whole word.
 * @param {string} text folded
 * @param {string} term folded
 */
function says(text, term) {
	const at = text.indexOf(term);
	if (at < 0) return false;
	const word = /[\p{L}\p{N}]/u;
	return !word.test(text[at - 1] || '') && !word.test(text[at + term.length] || '');
}

/**
 * How much a list is about these terms: its name or description saying one counts
 * most, then each of its companies sharing one.
 * @param {List} list
 * @param {string[]} members its companies' keys
 * @param {Set<string>} terms
 * @param {(key: string) => Company | undefined} companyOf
 */
export function relatedness(list, members, terms, companyOf) {
	const text = fold(`${list.name} ${list.description || ''}`);
	const named = [...terms].filter((term) => says(text, term)).length;
	const sharing = members.filter((key) => [...companyTerms(companyOf(key))].some((term) => terms.has(term))).length;
	return named * config.lists.related.nameWeight + sharing;
}

/**
 * The lists most about a job's city or field that do not show its company yet,
 * most related first.
 * @param {List[]} lists
 * @param {{
 *   company: string,
 *   terms: Set<string>,
 *   membersOf: (list: List) => string[],
 *   companyOf: (key: string) => Company | undefined,
 *   limit?: number
 * }} job company: the job's company key
 */
export function relatedLists(lists, { company, terms, membersOf, companyOf, limit = config.lists.related.shown }) {
	if (!terms.size) return [];
	return lists
		.map((list) => ({ list, members: membersOf(list) }))
		.filter(({ members }) => !members.includes(company))
		.map(({ list, members }) => ({ list, score: relatedness(list, members, terms, companyOf) }))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score || b.list.createdAt.localeCompare(a.list.createdAt))
		.slice(0, limit)
		.map(({ list }) => list);
}
