import config from '../src/lib/data/config.json' with { type: 'json' };
import { getDescription } from '../src/lib/ats/index.js';
import { mapLimit } from '../src/lib/atproto/xrpc.js';
import { workplaceFromText } from '../src/lib/models/workplace-text.js';

/**
 * Where board jobs are done when their board does not say it (most Greenhouse boards):
 * read once from each job's description (src/lib/models/workplace-text.js), kept by link,
 * so no job is asked twice. At most config.workplaces.perRun descriptions a run, the newest
 * jobs first, a few at a time: the boards are asked little, and a first run catches up over several.
 *
 * @typedef {import('./jobs.js').IndexedJob} IndexedJob
 * @typedef {Record<string, 'remote' | 'hybrid' | 'onsite' | ''>} WorkplaceCache
 *   by job link; '' read, and it says nothing.
 * @typedef {(company: import('../src/lib/models/company.js').Company, job: {id: string}) => Promise<string>} Describe
 */

/**
 * Sets `r` on the jobs whose description says it, and gives back what to keep for the next run.
 * @param {IndexedJob[]} jobs
 * @param {Map<string, import('../src/lib/models/company.js').Company>} companies by key
 * @param {WorkplaceCache} cache the last run's
 * @param {{perRun?: number, concurrency?: number, describe?: Describe}} [options]
 * @returns {Promise<{cache: WorkplaceCache, read: number, said: number}>}
 */
export async function readWorkplaces(jobs, companies, cache, options = {}) {
	const { perRun = config.workplaces.perRun, concurrency = config.workplaces.concurrency } = options;
	const describe = options.describe || ((company, job) => getDescription(company, /** @type {any} */ (job)));
	const unsaid = jobs.filter((j) => !j.s && !j.r && companies.has(j.c));
	const unread = unsaid
		.filter((j) => !(j.u in cache))
		.sort((a, b) => String(b.p || '').localeCompare(String(a.p || '')))
		.slice(0, perRun);
	/** @type {WorkplaceCache} */
	const found = {};
	await mapLimit(unread, concurrency, async (job) => {
		const company = /** @type {import('../src/lib/models/company.js').Company} */ (companies.get(job.c));
		const text = await describe(company, { id: job.i ?? job.u.slice(job.u.lastIndexOf('/') + 1) });
		// No text: the board did not answer, or not yet; asked again next run.
		if (text) found[job.u] = workplaceFromText(text) || '';
	});
	// Only the jobs still open are kept.
	/** @type {WorkplaceCache} */
	const kept = {};
	let said = 0;
	for (const job of unsaid) {
		const known = found[job.u] ?? cache[job.u];
		if (known === undefined) continue;
		kept[job.u] = known;
		if (known) {
			job.r = known;
			said++;
		}
	}
	return { cache: kept, read: Object.keys(found).length, said };
}
