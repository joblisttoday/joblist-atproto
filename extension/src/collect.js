/**
 * What a page has (its meta tags, its links, frames and scripts, the addresses it fetched,
 * and job board addresses in its data),
 * gathered in the page itself (scripting.executeScript runs this function
 * there, alone: it must use nothing from outside it). Read by models/page-read.js.
 * @returns {import('../../src/lib/models/page-read.js').Collected}
 */
export function collectPage() {
	/** @type {Record<string, string>} */
	const metas = {};
	for (const meta of document.querySelectorAll('meta[name][content], meta[property][content]')) {
		const name = (meta.getAttribute('property') || meta.getAttribute('name') || '').toLowerCase();
		if (name && !(name in metas)) metas[name] = (meta.getAttribute('content') || '').slice(0, 2000);
	}
	/** @type {string[]} */
	const links = [];
	for (const el of document.querySelectorAll('a[href], link[rel~="me"][href], iframe[src], script[src]')) {
		const raw = el.getAttribute('href') || el.getAttribute('src') || '';
		try {
			links.push(new URL(raw, location.href).href);
		} catch {
			// not a link
		}
		if (links.length >= 2000) break;
	}
	// What it fetched, too: a careers page showing its jobs itself asks its job board's API.
	for (const entry of performance.getEntriesByType('resource').slice(0, 500)) links.push(entry.name);
	// And job board addresses in its data (a careers page lists its jobs from embedded JSON);
	// the same hosts as src/lib/ats/detect.js, written here: this runs alone in the page.
	const boards = /(?:https?:)?\/\/[a-z0-9.-]+\.(?:greenhouse\.io|lever\.co|ashbyhq\.com|workable\.com|personio\.(?:de|com)|recruitee\.com|smartrecruiters\.com|rippling\.com)(?:\/[^\s"'<>\\)&]*)?/gi;
	const html = document.documentElement.outerHTML.slice(0, 5_000_000);
	links.push(...new Set((html.match(boards) || []).slice(0, 200).map((url) => (url.startsWith('//') ? `https:${url}` : url))));
	return { url: location.href, title: document.title.slice(0, 500), metas, links };
}
