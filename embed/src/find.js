import providers from '../../src/lib/data/providers.json' with { type: 'json' };
import { boardName } from '../../src/lib/ats/board-check.js';
import { detectBoard } from '../../src/lib/ats/detect.js';
import { getJobs } from '../../src/lib/ats/index.js';
import { newestFirst } from '../../src/lib/models/job.js';
import { prettyId } from '../../src/lib/models/paste.js';
import { fromSnapshot } from '../../src/lib/models/snapshot-job.js';
import { safeUrl } from '../../src/lib/models/url.js';

/**
 * What the embed shows: an organization's jobs, read live from its own board, as joblist reads
 * them (src/lib/ats/), the newest first.
 * @typedef {import('../../src/lib/ats/job.js').Job} Job
 * @typedef {{name: string, jobs: Job[]} | null} Found
 */

/**
 * A board as an embed names it: "greenhouse:acme", or its address. null when it is neither.
 * @param {string} text
 */
export function boardOf(text) {
	const value = text.trim();
	const [, provider, id] = value.match(/^([a-z]+):([^/\s]+)$/) || [];
	if (provider && id && providers.some((p) => p.id === provider)) return { provider, id };
	return value ? detectBoard(value) : null;
}

/** Its board's jobs, read now. @param {{provider: string, id: string}} board @param {string} key */
async function live(board, key) {
	const jobs = await getJobs(/** @type {any} */ ({ key, jobBoard: board }));
	newestFirst(jobs);
	return jobs;
}

/**
 * The board given, read live; else the company's board as an index says, read live, with the
 * offers it posted itself; else the index's copy of its jobs.
 * @param {{board: {provider: string, id: string} | null, company: string, index: string, dir: string}} asked
 * @returns {Promise<Found>}
 */
export async function find({ board, company, index, dir }) {
	if (board) {
		// The name its board gives (Greenhouse, Workable… say it), else its id as a name.
		const [name, jobs] = await Promise.all([boardName(board), live(board, board.id)]);
		return { name: name || prettyId(board.id), jobs };
	}
	if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(company)) return null;
	const file = await fetch(`${index}/${dir}/${company}.json`)
		.then((res) => (res.ok ? res.json() : null))
		.catch(() => null);
	if (!file) return null;
	const rows = Array.isArray(file.jobs) ? file.jobs : [];
	// The offers it posted itself (on Bluesky): their page on joblist is their link.
	/** @type {Job[]} */
	const posted = rows
		.filter((/** @type {any} */ j) => j.s && safeUrl(j.u))
		.map((/** @type {any} */ j) => ({ title: String(j.t), url: safeUrl(j.u), company, location: j.l, published: j.p, id: String(j.s), remote: j.r || '' }));
	/** @type {Job[]} */
	const copied = rows.map(fromSnapshot).filter((/** @type {Job | null} */ j) => j !== null);
	const known = file.board?.provider && file.board?.id ? { provider: String(file.board.provider), id: String(file.board.id) } : null;
	const fresh = known ? await live(known, company) : [];
	// Its board read now, and the offers it posted itself; the index's copy when the board said nothing.
	// How each is worked, when its board does not say: as the index read it from its description.
	const told = new Map(copied.map((j) => [j.url, j.remote]));
	const now = fresh.map((j) => (j.remote ? j : { ...j, remote: told.get(j.url) || '' }));
	const jobs = [...posted, ...(now.length ? now : copied)];
	newestFirst(jobs);
	return { name: String(file.name || company), jobs };
}
