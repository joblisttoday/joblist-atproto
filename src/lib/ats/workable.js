import { getJson, joinPlace, onceFor } from './job.js';
import { htmlToText } from './text.js';

/** @type {import('./index.js').Fetcher} */
export default async function workable(id) {
	const data = await getJson(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(id)}`);
	return (data?.jobs || []).map((/** @type {any} */ j) => ({
		id: j.shortcode,
		title: j.title,
		url: j.url || j.shortlink,
		location: j.telecommuting && !j.city ? joinPlace('Remote', j.country) : joinPlace(j.city, j.country),
		department: j.department,
		published: j.published_on,
		remote: j.telecommuting ? 'remote' : undefined
	}));
}

const board = onceFor((/** @type {string} */ id) =>
	getJson(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(id)}?details=true`)
);

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const job = (await board(id))?.jobs?.find((/** @type {any} */ j) => j.shortcode === jobId);
	return htmlToText(job?.description);
}
