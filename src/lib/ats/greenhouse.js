import { getJson } from './job.js';
import { htmlToText, unescapeHtml } from './text.js';

/** @type {import('./index.js').Fetcher} */
export default async function greenhouse(id) {
	const data = await getJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}/jobs`);
	return (data?.jobs || []).map((/** @type {any} */ j) => ({
		id: String(j.id),
		title: j.title,
		url: j.absolute_url,
		location: j.location?.name,
		published: j.first_published || j.updated_at
	}));
}

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const job = await getJson(
		`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}/jobs/${encodeURIComponent(jobId)}`
	);
	return htmlToText(unescapeHtml(job?.content));
}
