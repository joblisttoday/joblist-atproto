import config from '#lib/data/config.json';
import { isRemote, prepareJob } from '#lib/models/job.js';
import { prepareLocation } from '#lib/models/place.js';
import { whenIdle } from '#lib/navigation/after-paint.js';

let started = false;

/**
 * Reads every job for searches, its words and its place, some jobs at a time while the page
 * is idle (once): typing then answers at once, instead of after a second or more on a phone.
 * @param {import('#lib/ats/job.js').Job[]} jobs
 * @param {Map<string, string>} names company names by key
 */
export function prepareSearch(jobs, names) {
	if (started) return;
	started = true;
	const seen = new Set();
	let from = 0;
	const step = () => {
		const to = Math.min(jobs.length, from + config.jobs.prepareChunk);
		for (; from < to; from++) {
			const job = jobs[from];
			prepareJob(job, names);
			const remote = isRemote(job);
			const key = `${remote ? 'r' : 'o'}${job.location || ''}`;
			if (seen.has(key)) continue;
			seen.add(key);
			prepareLocation(job.location, remote);
		}
		if (from < jobs.length) whenIdle(step, config.jobs.prepareWaitMs);
	};
	whenIdle(step, config.jobs.prepareWaitMs);
}
