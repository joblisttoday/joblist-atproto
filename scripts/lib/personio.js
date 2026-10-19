/**
 * Personio jobs in node, where the app's fetcher cannot run (it needs the
 * browser's DOMParser). Reads the same XML feed with a regex.
 */

/** @param {string} xml @param {string} tag */
function tagText(xml, tag) {
	const match = xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
	return match?.[1].trim() || undefined;
}

/** @param {string} id */
export default async function personio(id) {
	const base = `https://${encodeURIComponent(id)}.jobs.personio.de`;
	const res = await fetch(`${base}/xml?language=en`);
	if (!res.ok) return [];
	const xml = await res.text();
	return [...xml.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, p]) => ({
		title: tagText(p, 'name') || '',
		url: `${base}/job/${tagText(p, 'id')}`,
		location: tagText(p, 'office'),
		department: tagText(p, 'department'),
		published: tagText(p, 'createdAt')
	}));
}
