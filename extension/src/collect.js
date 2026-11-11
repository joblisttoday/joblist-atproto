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
	// Its own careers page: a link whose address says so (/careers, /jobs…), else one whose
	// words are just that ("Careers", "We're hiring"…), in several languages: never a sentence
	// that happens to say "jobs".
	const careerPath = /^\/([a-z]{2}(-[a-z]{2})?\/)?(company\/)?(careers?|jobs|join(-us)?|work-with-us|hiring|karriere|stellen|emplois|carrieres?|recrutement|empleos?|vacatures)(\/|$)/i;
	const careerLabel = /^(careers?|jobs|open (jobs|positions|roles)|join (us|our team|the team)|work (with|at) us|we.?re hiring|karriere|jobs (&|und) karriere|stellenangebote|emplois|carri[eè]res?|recrutement|nous rejoindre|empleos?|trabaja con nosotros|únete|vacatures|lavora con noi)$/i;
	/** @type {string[]} */
	const byPath = [];
	/** @type {string[]} */
	const byLabel = [];
	for (const a of document.querySelectorAll('a[href]')) {
		const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
		try {
			const url = new URL(a.getAttribute('href') || '', location.href);
			if (!/^https?:$/.test(url.protocol)) continue;
			if (careerPath.test(url.pathname)) byPath.push(url.href);
			else if (text.length <= 40 && careerLabel.test(text)) byLabel.push(url.href);
		} catch {
			// not a link
		}
	}
	const careers = [...new Set([...byPath, ...byLabel])].slice(0, 10);
	return { url: location.href, title: document.title.slice(0, 500), metas, links, careers };
}
