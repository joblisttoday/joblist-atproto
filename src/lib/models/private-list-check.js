import config from '#lib/data/config.json' with { type: 'json' };
import { isCompanyKey } from './landing.js';

/**
 * Private lists of organizations read from a file someone imports (the file that moves
 * their private lists to another device): as records kept in this browser
 * (network/local-lists.svelte.js), each checked within the lexicon's limits.
 * @typedef {{rkey: string, value: {name: string, description?: string, companies: string[], createdAt: string}}} PrivateList
 */

/** A key as newLocalKey makes them. */
const RKEY = /^l[a-z0-9]{1,40}$/;
const { nameMax, descriptionMax, companiesMax } = config.listForm;
/** The file's lists: at most as many as lists of jobs. */
const MAX = config.jobCollections.max;

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

/** @param {unknown} value @param {number} max @returns {value is string} */
const isText = (value, max) => typeof value === 'string' && value.length <= max;

/** @param {unknown} item @returns {PrivateList | null} */
function cleanList(item) {
	if (!isObject(item) || !isText(item.rkey, 41) || !RKEY.test(item.rkey) || !isObject(item.value)) return null;
	const { name, description, companies, createdAt } = item.value;
	if (!isText(name, nameMax) || !name.trim()) return null;
	if (description !== undefined && !isText(description, descriptionMax)) return null;
	if (!Array.isArray(companies) || companies.length > companiesMax || !companies.every(isCompanyKey)) return null;
	if (!isText(createdAt, 40) || !Number.isFinite(Date.parse(createdAt))) return null;
	return { rkey: item.rkey, value: { name, ...(description ? { description } : {}), companies: [...companies], createdAt } };
}

/**
 * The private lists of a file, or null when any of them is not right (the file is refused whole).
 * @param {unknown} lists
 * @returns {PrivateList[] | null}
 */
export function readPrivateLists(lists) {
	if (lists === undefined) return [];
	if (!Array.isArray(lists) || lists.length > MAX) return null;
	const clean = lists.map(cleanList);
	if (clean.some((l) => !l)) return null;
	const keys = new Set(clean.map((l) => l?.rkey));
	return keys.size === clean.length ? /** @type {PrivateList[]} */ (clean) : null;
}
