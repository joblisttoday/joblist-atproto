import { getJson, joinPlace, onceFor } from './job.js';
import { htmlToText } from './text.js';

/** @type {import('./index.js').Fetcher} */
export default async function recruitee(id) {
	const data = await getJson(`https://${encodeURIComponent(id)}.recruitee.com/api/offers`);
	return (data?.offers || []).map((/** @type {any} */ j) => ({
		id: String(j.id),
		title: j.title,
		url: j.careers_url,
		location: j.location || joinPlace(j.city, j.country),
		department: j.department,
		published: j.published_at,
		remote: j.remote ? 'remote' : j.hybrid ? 'hybrid' : j.on_site ? 'onsite' : undefined
	}));
}

const board = onceFor((/** @type {string} */ id) => getJson(`https://${encodeURIComponent(id)}.recruitee.com/api/offers`));

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const job = (await board(id))?.offers?.find((/** @type {any} */ j) => String(j.id) === jobId);
	return job ? htmlToText(`${job.description || ''}${job.requirements || ''}`) : '';
}
