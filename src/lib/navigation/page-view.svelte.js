import { replaceState } from '$app/navigation';
import { page as route } from '$app/state';
import { untrack } from 'svelte';
import config from '#lib/data/config.json';
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
	// The job open over the page (job-open.svelte.js) stays open, and in the address.
	$effect(() => {
		const view = state.view === 'grid' ? '' : state.view;
		untrack(() => keepAddress({ view, [config.jobs.jobParam]: route.state.job?.url || readAddress([config.jobs.jobParam]).get(config.jobs.jobParam) }, (url) => replaceState(url, route.state)));
	});
	return state;
}
