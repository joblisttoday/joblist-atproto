/**
 * How someone likes to see jobs: on the map, as a list, or as a grid of cards
 * (wide screens). Kept in this browser; the map until they choose.
 * @typedef {'map' | 'list' | 'grid'} ExploreView
 */

const KEY = 'joblist.view.v1';

/** @returns {ExploreView} */
export function readView() {
	try {
		const view = localStorage.getItem(KEY);
		return view === 'list' || view === 'grid' ? view : 'map';
	} catch {
		return 'map';
	}
}

/** @param {ExploreView} view */
export function writeView(view) {
	try {
		localStorage.setItem(KEY, view);
	} catch {
		// storage blocked: the choice lasts until the page closes
	}
}
