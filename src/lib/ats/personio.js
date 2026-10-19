/** @type {import('./index.js').Fetcher} */
export default async function personio(id) {
	const base = `https://${encodeURIComponent(id)}.jobs.personio.de`;
	try {
		const res = await fetch(`${base}/xml?language=en`);
		if (!res.ok) return [];
		const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');
		/** @param {Element} el @param {string} tag */
		const text = (el, tag) => el.getElementsByTagName(tag)[0]?.textContent?.trim() || undefined;
		return [...xml.getElementsByTagName('position')].map((p) => ({
			title: text(p, 'name') || '',
			url: `${base}/job/${text(p, 'id')}`,
			location: text(p, 'office'),
			department: text(p, 'department'),
			published: text(p, 'createdAt')
		}));
	} catch {
		return [];
	}
}
