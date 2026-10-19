/**
 * The "Add to joblist" bookmarklet. It runs on any page, in the page itself:
 * it must stay self-contained (no imports, no outside names) because its source
 * text becomes the bookmark.
 *
 * It sends the page, its site name and the first job board it links to
 * (same hosts as #lib/ats/detect.js) to joblist's add page, in a new tab.
 *
 * @param {string} origin joblist's origin
 * @param {Document} [doc]
 * @param {Pick<Window, 'open'>} [win]
 */
export function addToJoblist(origin, doc = document, win = window) {
	const hosts = /(^|\.)(greenhouse\.io|lever\.co|ashbyhq\.com|workable\.com|personio\.(de|com)|recruitee\.com|smartrecruiters\.com|rippling\.com)$/i;
	const meta = doc.querySelector('meta[property="og:site_name"],meta[name="application-name"]');
	const title = doc.title.trim();
	const name = meta?.getAttribute('content') || (/^[^|:\-–—·]{1,40}$/.test(title) ? title : '');
	let board = '';
	for (const el of doc.querySelectorAll('a[href],iframe[src],script[src]')) {
		try {
			const url = new URL(el.getAttribute('href') || el.getAttribute('src') || '', doc.location.href);
			if (hosts.test(url.hostname)) {
				board = url.href;
				break;
			}
		} catch {}
	}
	const query = new URLSearchParams({ url: doc.location.href, name, board });
	win.open(`${origin}/add?${query}`, '_blank');
}

/**
 * The bookmark's address.
 * @param {string} origin
 */
export function bookmarklet(origin) {
	return `javascript:(${addToJoblist})(${JSON.stringify(origin)})`;
}
