<script>
	import FollowFeed from './FollowFeed.svelte';
	import { searchFeed } from '#lib/models/landing.js';
	import { toParams } from '#lib/models/saved-search.js';
	import { getLandingIndex } from '#lib/network/landing.js';

	/**
	 * Follow a search in a feed reader: a city's feed when it has a page (alone or with
	 * a field's search words: /feed/in/berlin/design.xml), else the feed of the search
	 * itself (/feed/search.xml?q=…), made from its address only. A search near someone
	 * has none: where they are never leaves this browser.
	 * @type {{filters: import('#lib/models/job.js').JobFilters}}
	 */
	let { filters } = $props();
	/** @type {import('#lib/models/landing.js').LandingIndex | null} */
	let index = $state.raw(null);
	getLandingIndex().then((found) => (index = found));
	const search = $derived(filters.near || filters.area ? '' : toParams(filters));
	const feed = $derived(search ? searchFeed(index, filters) || { search } : null);
</script>

{#if feed}<FollowFeed {feed} />{/if}
