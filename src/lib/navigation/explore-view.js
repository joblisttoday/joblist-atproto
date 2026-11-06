/**
 * How someone likes to see jobs: on the map, or as a list. Kept in this browser;
 * the map until they choose.
 * @typedef {'map' | 'list'} ExploreView
 */

const KEY = 'joblist.view.v1';

/** @returns {ExploreView} */
export function readView() {
	try {
		return localStorage.getItem(KEY) === 'list' ? 'list' : 'map';
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
