/**
 * How someone likes to see a page of things (jobs, companies): on the map, as a
 * list, or as a grid of cards (wide screens). Kept in this browser, per page;
 * the page's own default until they choose.
 * @typedef {'map' | 'list' | 'grid'} ExploreView
 */

/** @param {string} page @param {ExploreView} fallback @returns {ExploreView} */
export function readView(page = 'jobs', fallback = 'map') {
	try {
		const view = localStorage.getItem(key(page));
		return view === 'list' || view === 'grid' || view === 'map' ? view : fallback;
	} catch {
		return fallback;
	}
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
