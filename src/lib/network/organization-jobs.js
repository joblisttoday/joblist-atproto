import config from '#lib/data/config.json' with { type: 'json' };
import providers from '#lib/data/providers.json' with { type: 'json' };
import { resolveDid } from '#lib/atproto/identity.js';
import { getRecord, listRecords } from '#lib/atproto/records.js';
import { getJobs } from '#lib/ats/index.js';
import { newestFirst } from '#lib/models/job.js';
import { isLive, toJob, toPost } from '#lib/models/job-post.js';

/**
 * An organization's jobs from its own atproto account (its handle is its domain): the board
 * its record points to, read live, else the offers it posts itself. Only its own account
 * counts. null when the domain has no account, or the account says nothing of jobs.
 * Read by the app (a followed organization with no board known) and the embed
 * (organization="acme.org").
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @param {string} domain
 * @returns {Promise<{name: string, board: {provider: string, id: string} | null, jobs: Job[]} | null>}
 */
export async function organizationJobs(domain) {
	const key = domain.trim().toLowerCase();
	if (!key) return null;
	let did;
	try {
		did = await resolveDid(key);
	} catch {
		// Not an account: nothing to read there.
		return null;
	}
	const [company, records] = await Promise.all([
		getRecord(did, config.collections.company, key).catch(() => null),
		listRecords(did, config.collections.job).catch(() => [])
	]);
	if (!company && !records.length) return null;
	const name = String(company?.value?.name || key);
	const { provider = '', id = '' } = company?.value?.jobBoard || {};
	if (id && providers.some((p) => p.id === provider)) {
		const board = { provider, id };
		const jobs = await getJobs(/** @type {any} */ ({ key, jobBoard: board }));
		newestFirst(jobs);
		return { name, board, jobs };
	}
	// The handle resolved to this account: it speaks for the domain.
	const profiles = new Map([[did, { handle: key }]]);
	const jobs = records.filter((r) => isLive(r.value) && r.value.company === key).map((r) => toJob(toPost(r, profiles)));
	newestFirst(jobs);
	return { name, board: null, jobs };
}
