import { getJson, joinPlace } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function workable(id) {
	const data = await getJson(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(id)}`);
	return (data?.jobs || []).map((/** @type {any} */ j) => ({
		title: j.title,
		url: j.url || j.shortlink,
		location: j.telecommuting && !j.city ? joinPlace('Remote', j.country) : joinPlace(j.city, j.country),
		department: j.department,
		published: j.published_on
	}));
}
