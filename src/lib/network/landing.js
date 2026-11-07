import config from '#lib/data/config.json';
import { safeUrl } from '#lib/models/url.js';
import { indexFile, landingFile } from '#lib/models/landing.js';

/**
 * The pages per city and field, read in the app from the same small snapshot
 * files the Worker renders them from (indexer/landing.js).
 * @typedef {import('#lib/models/landing.js').LandingFile} LandingFile
 * @typedef {import('#lib/models/landing.js').LandingIndex} LandingIndex
 */

/** @param {string} name @returns {Promise<any>} null when missing or unreadable */
async function getFile(name) {
	try {
		const res = await fetch(`${config.snapshot.path}/${name}`);
		return res.ok ? await res.json() : null;
	} catch {
		return null;
	}
}

/** @type {Promise<LandingIndex | null> | null} */
let indexPromise = null;
/** Every city and field with a page (read once). */
export function getLandingIndex() {
	indexPromise ??= getFile(indexFile());
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
	return { title: String(j.t), url, company: String(j.c || ''), location: j.l, published: j.p, remote: j.r, id: j.i ?? url.slice(url.lastIndexOf('/') + 1) };
}
