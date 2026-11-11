/**
 * How someone likes to see a page of things (jobs, companies): on the map, as a
 * list, or as a grid of cards (wide screens).
 * Kept in this browser, per page; the page's own default until they choose.
 * @typedef {'map' | 'list' | 'grid'} ExploreView
 */

/** The views pages have. @type {ExploreView[]} */
const VIEWS = ['list', 'grid', 'map'];

/** @param {string} page @param {ExploreView} fallback @param {ExploreView[]} [views] the page's @returns {ExploreView} */
export function readView(page = 'jobs', fallback = 'map', views = VIEWS) {
	try {
		const view = /** @type {ExploreView} */ (localStorage.getItem(key(page)));
		return views.includes(view) ? view : fallback;
	} catch {
		return fallback;
	}
}

/**
 * A view an address asks for: null when it is none.
 * @param {string | null} text
 * @param {ExploreView[]} [views] the page's
 * @returns {ExploreView | null}
 */
export function viewParam(text, views = VIEWS) {
	return views.includes(/** @type {ExploreView} */ (text)) ? /** @type {ExploreView} */ (text) : null;
}

/** @param {ExploreView} view @param {string} page */
export function writeView(view, page = 'jobs') {
	try {
		localStorage.setItem(key(page), view);
	} catch {
		// storage blocked: the choice lasts until the page closes
	}
}

/** The jobs' choice keeps its first name. @param {string} page */
const key = (page) => (page === 'jobs' ? 'joblist.view.v1' : `joblist.view.${page}.v1`);
