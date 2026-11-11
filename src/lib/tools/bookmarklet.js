/**
 * The "joblist" bookmarklet: on any page, it opens joblist on it, in a new tab
 * (/me/organization#url=…): an organization joblist knows goes to its page; a job board or a
 * website gets what joblist finds of it, to save or suggest. It sends the page's address
 * only, after the "#" (no server sees it). It runs in the page itself: it must stay
 * self-contained (no imports, no outside names), its source text being the bookmark.
 * The browser add-on (extension/) reads the page itself (its name, links, careers page).
 *
 * @param {string} origin joblist's origin
 * @param {Pick<Document, 'location'>} [doc]
 * @param {Pick<Window, 'open'>} [win]
 */
export function addToJoblist(origin, doc = document, win = window) {
	win.open(`${origin}/me/organization#url=${encodeURIComponent(doc.location.href)}`, '_blank');
}

/**
 * The bookmark's address.
 * @param {string} origin
 */
export function bookmarklet(origin) {
	return `javascript:(${addToJoblist})(${JSON.stringify(origin)})`;
}
