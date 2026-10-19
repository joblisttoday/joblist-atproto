import { getJson } from './job.js';

/** @type {import('./index.js').Fetcher} */
export default async function lever(id) {
	const data = await getJson(`https://api.lever.co/v0/postings/${encodeURIComponent(id)}?mode=json`);
	return (data || []).map((/** @type {any} */ j) => ({
		title: j.text,
		url: j.hostedUrl,
		location: (j.categories?.allLocations || [j.categories?.location]).filter(Boolean).join(', '),
		department: j.categories?.team || j.categories?.department,
		published: j.createdAt ? new Date(j.createdAt).toISOString() : undefined
	}));
}
