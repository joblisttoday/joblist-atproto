import { getJson } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function greenhouse(id) {
	const data = await getJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}/jobs`);
	return (data?.jobs || []).map((/** @type {any} */ j) => ({
		title: j.title,
		url: j.absolute_url,
		location: j.location?.name,
		published: j.first_published || j.updated_at
	}));
}
