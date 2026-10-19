import { getJson } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function ashby(id) {
	const data = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(id)}`);
	return (data?.jobs || [])
		.filter((/** @type {any} */ j) => j.isListed !== false)
		.map((/** @type {any} */ j) => ({
			title: j.title,
			url: j.jobUrl,
			location: [j.location, ...(j.secondaryLocations || []).map((/** @type {any} */ l) => l.location)]
				.filter(Boolean)
				.join(', '),
			department: j.department,
			published: j.publishedAt
		}));
}
