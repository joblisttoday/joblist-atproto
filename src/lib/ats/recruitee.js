import { getJson, joinPlace } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function recruitee(id) {
	const data = await getJson(`https://${encodeURIComponent(id)}.recruitee.com/api/offers`);
	return (data?.offers || []).map((/** @type {any} */ j) => ({
		title: j.title,
		url: j.careers_url,
		location: j.location || joinPlace(j.city, j.country),
		department: j.department,
		published: j.published_at
	}));
}
