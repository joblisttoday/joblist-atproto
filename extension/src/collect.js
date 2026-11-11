/**
 * What a page has, gathered in the page itself (scripting.executeScript runs this function
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
	return { url: location.href, title: document.title.slice(0, 500), metas, links };
}
