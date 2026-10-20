import { getJson, toWorkplace } from './job.js';
import { htmlToText } from './text.js';

/** @type {import('./index.js').Fetcher} */
export default async function lever(id) {
	const data = await getJson(`https://api.lever.co/v0/postings/${encodeURIComponent(id)}?mode=json`);
	return (data || []).map((/** @type {any} */ j) => ({
		id: j.id,
		title: j.text,
		url: j.hostedUrl,
		location: (j.categories?.allLocations || [j.categories?.location]).filter(Boolean).join(', '),
		department: j.categories?.team || j.categories?.department,
		published: j.createdAt ? new Date(j.createdAt).toISOString() : undefined,
		remote: toWorkplace(j.workplaceType)
	}));
}

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const j = await getJson(`https://api.lever.co/v0/postings/${encodeURIComponent(id)}/${encodeURIComponent(jobId)}`);
	if (!j) return '';
	const lists = (j.lists || []).map((/** @type {any} */ l) => `${l.text}\n${htmlToText(l.content)}`);
	return [j.descriptionPlain, ...lists, j.additionalPlain].filter(Boolean).join('\n\n').trim();
}
