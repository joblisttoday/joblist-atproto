import config from '#lib/data/config.json' with { type: 'json' };
import { BUILTIN, FORMAT, emptyCollections, isBuiltin } from './job-collection.js';
import { listsToKept, mergeKept, readKept } from './kept.js';

/**
 * Collections read from outside: this browser's storage, or a file someone imports.
 * Everything is checked: types, lengths, dates, and only http(s) links.
 * @typedef {import('./job-collection.js').Collections} Collections
 * @typedef {import('./job-collection.js').Collection} Collection
 * @typedef {import('./job-collection.js').SavedJob} SavedJob
 * @typedef {import('./job-mark.js').JobMark} JobMark
 */

const limits = config.jobCollections;
const ID = new RegExp(`^[a-z0-9-]{1,${limits.idMax}}$`);

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

/** @param {unknown} value @param {number} max @param {number} [min] @returns {value is string} */
const isText = (value, max, min = 0) => typeof value === 'string' && value.length >= min && value.length <= max;

/** @param {unknown} value @returns {value is string} */
const isDate = (value) => isText(value, 40, 1) && Number.isFinite(Date.parse(value));

/** @param {unknown} value @returns {value is string} */
function isWebUrl(value) {
	if (!isText(value, limits.urlMax, 1)) return false;
	try {
		return ['http:', 'https:'].includes(new URL(value).protocol);
	} catch {
		return false;
	}
}

/** @param {unknown} job @returns {SavedJob | null} */
function cleanJob(job) {
	if (!isObject(job)) return null;
	const { title, company, url, at } = job;
	if (!isText(title, limits.titleMax, 1) || !isText(company, limits.companyMax) || !isWebUrl(url) || !isDate(at)) return null;
	return { title, company, url, at };
}

/**
 * @param {unknown} collection
 * @returns {{value: Collection | null, dropped: number}}
 */
function cleanCollection(collection) {
	if (!isObject(collection)) return { value: null, dropped: 1 };
	const { id, name, at, jobs } = collection;
	const named = isText(name, limits.nameMax, 1) && !!name.trim();
	if (!isText(id, limits.idMax) || !ID.test(id) || !isObject(jobs)) return { value: null, dropped: 1 };
	if (isBuiltin(id) ? name !== '' : !named || !isDate(at)) return { value: null, dropped: 1 };
	/** @type {Record<string, SavedJob>} */
	const kept = {};
	let count = 0;
	let dropped = 0;
	for (const [key, job] of Object.entries(jobs)) {
		const clean = isText(key, limits.keyMax, 1) && key !== '__proto__' && count < limits.jobsMax ? cleanJob(job) : null;
		if (clean) {
			kept[key] = clean;
			count++;
		} else dropped++;
	}
	return { value: { id, name: /** @type {string} */ (name), at: isBuiltin(id) ? '' : /** @type {string} */ (at), jobs: kept }, dropped };
}

/**
 * Collections from anything: what is not right is left out and counted.
 * The built-in ones are always there, first.
 * @param {unknown} value
 * @returns {{value: Collections, dropped: number}}
 */
export function cleanCollections(value) {
	const list = isObject(value) && Array.isArray(value.collections) ? value.collections : null;
	if (!list) return { value: emptyCollections(), dropped: 1 };
	/** @type {Map<string, Collection>} */
	const byId = new Map();
	let dropped = 0;
	for (const item of list) {
		const { value: collection, dropped: lost } = cleanCollection(item);
		dropped += lost;
		if (collection && !byId.has(collection.id) && byId.size < limits.max) byId.set(collection.id, collection);
		else if (collection) dropped++;
	}
	const builtins = BUILTIN.map((id) => byId.get(id) || emptyCollections().collections.find((c) => c.id === id));
	const named = [...byId.values()].filter((c) => !isBuiltin(c.id));
	return { value: { collections: /** @type {Collection[]} */ ([...builtins, ...named]) }, dropped };
}

/**
 * The applied and hidden marks of before collections, as collections.
 * @param {unknown} marks Record<string, JobMark>
 */
export function fromMarks(marks) {
	const state = emptyCollections();
	if (isObject(marks)) {
		for (const [key, mark] of Object.entries(marks)) {
			const collection = isObject(mark) && state.collections.find((c) => c.id === mark.mark);
			if (collection) collection.jobs[key] = /** @type {any} */ ({ title: mark.title, company: mark.company, url: mark.url, at: mark.at });
		}
	}
	return cleanCollections(state).value;
}

/**
 * What an exported file keeps: its lists of jobs, refused whole when anything in them is not
 * right; its saved organizations (version 3), or those of its private lists (version 2),
 * each checked, those not right left out.
 * @param {string} text
 * @returns {{collections: Collections, organizations: import('./kept.js').Kept[]}}
 * @throws {Error} its message: 'json', 'format' or 'invalid'
 */
export function readCollectionsFile(text) {
	if (text.length > limits.fileMaxBytes) throw new Error('format');
	/** @type {unknown} */
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		throw new Error('json');
	}
	if (!isObject(value) || value.format !== FORMAT || ![1, 2, 3].includes(/** @type {number} */ (value.version)) || !Array.isArray(value.collections))
		throw new Error('format');
	const { value: collections, dropped } = cleanCollections(value);
	if (dropped) throw new Error('invalid');
	const organizations = mergeKept(readKept(value.organizations), listsToKept(value.lists), config.kept.max);
	return { collections, organizations };
}
