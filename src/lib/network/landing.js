import config from '#lib/data/config.json';
import { safeUrl } from '#lib/models/url.js';
import { indexFile, landingFile } from '#lib/models/landing.js';

/**
 * The pages per city and field, read in the app from the same small snapshot
 * files the Worker renders them from (indexer/landing.js).
 * @typedef {import('#lib/models/landing.js').LandingFile} LandingFile
 * @typedef {import('#lib/models/landing.js').LandingIndex} LandingIndex
 */

/**
 * @param {string} name
 * @returns {Promise<any>} null when there is no such file (no page there); it throws when the
 *   snapshot did not answer (offline, a server down), so a page can say which.
 */
async function getFile(name) {
	const res = await fetch(`${config.snapshot.path}/${name}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`${name}: ${res.status}`);
	return res.json();
}

/** @type {Promise<LandingIndex | null> | null} */
let indexPromise = null;
/** Every city and field with a page (read once). */
export function getLandingIndex() {
	// A failed read is tried again by the next page that asks.
	indexPromise ??= getFile(indexFile()).catch((err) => {
		indexPromise = null;
		throw err;
	});
	return indexPromise;
}

/**
 * One page's newest jobs (or, from page 2, older ones), as the app shows jobs.
 * @param {{city?: string, field?: string, page?: number}} page
 * @returns {Promise<(Omit<LandingFile, 'jobs'> & {jobs: import('#lib/ats/job.js').Job[]}) | null>}
 */
export async function getLandingPage(page) {
	const file = await getFile(landingFile(page));
	if (!file || !Array.isArray(file.jobs)) return null;
	return { ...file, jobs: file.jobs.map(toJob).filter((/** @type {any} */ j) => j !== null) };
}

/**
 * @param {any} j a landing file's job
 * @returns {import('#lib/ats/job.js').Job | null}
 */
function toJob(j) {
	const url = safeUrl(j?.u);
	if (!url || !j.t) return null;
	const point = Array.isArray(j.g) && j.g.length === 2 && j.g.every(Number.isFinite) ? /** @type {[number, number]} */ ([j.g[0], j.g[1]]) : undefined;
	return { title: String(j.t), url, company: String(j.c || ''), location: j.l, published: j.p, remote: j.r, id: j.i ?? url.slice(url.lastIndexOf('/') + 1), point };
}
