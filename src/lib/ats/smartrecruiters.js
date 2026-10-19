import { getJson } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function smartrecruiters(id) {
	const data = await getJson(
		`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings?limit=100`
	);
	return (data?.content || []).map((/** @type {any} */ j) => ({
		title: j.name,
		url: `https://jobs.smartrecruiters.com/${encodeURIComponent(id)}/${j.id}`,
		location: j.location?.fullLocation,
		department: j.department?.label,
		published: j.releasedDate
	}));
}
