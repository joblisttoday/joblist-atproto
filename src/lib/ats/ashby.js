import { getJson, onceFor, toWorkplace } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function ashby(id) {
	const data = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(id)}`);
	return (data?.jobs || [])
		.filter((/** @type {any} */ j) => j.isListed !== false)
		.map((/** @type {any} */ j) => ({
			id: j.id,
			title: j.title,
			url: j.jobUrl,
			location: [j.location, ...(j.secondaryLocations || []).map((/** @type {any} */ l) => l.location)]
				.filter(Boolean)
				.join(', '),
			department: j.department,
			published: j.publishedAt,
			remote: toWorkplace(j.workplaceType) || (j.isRemote ? 'remote' : undefined)
		}));
}

const board = onceFor((/** @type {string} */ id) =>
	getJson(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(id)}`)
);

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const job = (await board(id))?.jobs?.find((/** @type {any} */ j) => j.id === jobId);
	return job?.descriptionPlain || '';
}
