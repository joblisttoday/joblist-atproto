import { replaceState } from '$app/navigation';
import { keepAddress, readAddress } from './address.js';
import { readView, viewParam } from './explore-view.js';

/**
 * How a page shows its things (list, grid, map): what its address asks (#view=map), else what
 * was last chosen for this kind of page, else grid; kept in the address as it changes.
 * Call it while the page's component starts.
 * @param {string} page the kind of page (explore-view.js)
 * @param {import('./explore-view.js').ExploreView[]} [views] those it has
 */
export function pageView(page, views = ['list', 'grid', 'map']) {
	/** @param {string | null} asked */
	const allowed = (asked) => {
		const v = viewParam(asked);
		return v && views.includes(v) ? v : null;
	};
	const state = $state({ view: allowed(readAddress(['view']).get('view')) || allowed(readView(page, 'grid')) || 'grid' });
	$effect(() => keepAddress({ view: state.view === 'grid' ? '' : state.view }, (url) => replaceState(url, {})));
	return state;
}
