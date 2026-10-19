import { getJson } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function rippling(id) {
	const jobs = [];
	for (let page = 0; page < 20; page++) {
		const data = await getJson(
			`https://api.rippling.com/platform/api/ats/v2/board/${encodeURIComponent(id)}/jobs?page=${page}`
		);
		jobs.push(...(data?.items || []));
		if (!data || page + 1 >= (data.totalPages || 0)) break;
	}
	return jobs.map((/** @type {any} */ j) => ({
		title: j.name,
		url: j.url,
		location: (j.locations || []).map((/** @type {any} */ l) => l.name).join(', '),
		department: j.department?.name
	}));
}
