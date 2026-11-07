<script>
	import FollowFeed from './FollowFeed.svelte';
	import { searchFeed } from '#lib/models/landing.js';
	import { getLandingIndex } from '#lib/network/landing.js';

	/**
	 * Follow a search in a feed reader, when it has a feed: a city with a page,
	 * alone or with a field's search words (/feed/in/berlin/design.xml).
	 * @type {{filters: import('#lib/models/job.js').JobFilters}}
	 */
	let { filters } = $props();
	/** @type {import('#lib/models/landing.js').LandingIndex | null} */
	let index = $state.raw(null);
	getLandingIndex().then((found) => (index = found));
	const feed = $derived(searchFeed(index, filters));
</script>

{#if feed}<FollowFeed {feed} />{/if}
