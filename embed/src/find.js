import providers from '../../src/lib/data/providers.json' with { type: 'json' };
import { boardName } from '../../src/lib/ats/board-check.js';
import { detectBoard } from '../../src/lib/ats/detect.js';
import { getJobs } from '../../src/lib/ats/index.js';
import { newestFirst } from '../../src/lib/models/job.js';
import { prettyId } from '../../src/lib/models/paste.js';
import { organizationJobs } from '../../src/lib/network/organization-jobs.js';

/**
 * What the embed shows: an organization's jobs, read live from its own board, as joblist reads
 * them (src/lib/ats/), the newest first; or, for an organization on atproto (its handle is its
 * domain), its own description and the jobs it points to or posts from its account.
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
 * The board given, read live: its name and its jobs, newest first.
 * @param {{provider: string, id: string} | null} board
 * @returns {Promise<Found>}
 */
export async function find(board) {
	if (!board) return null;
	// The name its board gives (Greenhouse, Workable… say it), else its id as a name.
	const [name, jobs] = await Promise.all([boardName(board), live(board, board.id)]);
	return { name: name || prettyId(board.id), jobs };
}

/**
 * An organization by its domain, from its own atproto account (its handle is its domain): its
 * name, and its jobs (network/organization-jobs.js).
 * @param {string} domain
 * @returns {Promise<Found>}
 */
export async function findOrganization(domain) {
	const found = await organizationJobs(domain).catch(() => null);
	return found ? { name: found.name, jobs: found.jobs } : null;
}
