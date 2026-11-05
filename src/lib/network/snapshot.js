import config from '#lib/data/config.json';

/**
 * The AppView snapshot: static files rebuilt on a schedule by indexer/.
 * Optional: when missing (local development) or stale, the app reads
 * the network and the job boards directly, as before.
 */

/** @param {string} name */
async function getFile(name) {
	try {
		const res = await fetch(`${config.snapshot.path}/${name}`);
		return res.ok ? await res.json() : null;
	} catch {
		return null;
	}
}

/** @param {string | undefined} generatedAt */
function fresh(generatedAt) {
	const age = Date.now() - new Date(generatedAt || 0).getTime();
	return age < config.snapshot.maxAgeHours * 3600 * 1000;
}

/** Records as of the last snapshot, in the shape of the local cache. */
export function getSnapshotRecords() {
	return getFile('records.json');
}

/**
 * @typedef {{jobs: Map<string, import('#lib/ats/job.js').Job[]>, checked: Set<string>}} SnapshotJobs
 * @type {Promise<SnapshotJobs | null> | null}
 */
let jobsPromise = null;

/** Jobs as of the last snapshot, by company key; null when missing or stale. */
export function getSnapshotJobs() {
	jobsPromise ??= getFile('jobs.json').then((data) => {
		if (!data || !fresh(data.generatedAt)) return null;
		/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
		const jobs = new Map();
		for (const j of data.jobs) {
			// Posted jobs come from their records, read with the others (they may be edited or deleted since).
			if (j.s?.startsWith('at://')) continue;
			const list = jobs.get(j.c) || [];
			list.push({ title: j.t, url: j.u, company: j.c, location: j.l, department: j.d, published: j.p, id: j.i, remote: j.r, point: j.g });
			jobs.set(j.c, list);
		}
		return { jobs, checked: new Set(data.checked || []) };
	});
	return jobsPromise;
}
