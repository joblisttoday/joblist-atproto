/** @type {import('./index.js').Fetcher} */
export default async function personio(id) {
	const base = `https://${encodeURIComponent(id)}.jobs.personio.de`;
	try {
		const res = await fetch(`${base}/xml?language=en`);
		if (!res.ok) return [];
		return positions(await res.text()).map((p) => ({
			title: p.name || '',
			url: `${base}/job/${p.id}`,
			location: p.office,
			department: p.department,
			published: p.createdAt
		}));
	} catch {
		return [];
	}
}

/**
 * The <position> entries of a Personio XML feed, as plain objects.
 * Text-based, so it runs in browsers and in Node (for the indexer).
 * @param {string} xml
 * @returns {Record<string, string>[]}
 */
function positions(xml) {
	return [...xml.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, body]) => {
		/** @type {Record<string, string>} */
		const fields = {};
		for (const [, tag, value] of body.matchAll(/<(\w+)>([^<]*)<\/\1>/g)) fields[tag] = decode(value.trim());
		return fields;
	});
}

/** @param {string} text */
function decode(text) {
	return text
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&amp;/g, '&');
}
