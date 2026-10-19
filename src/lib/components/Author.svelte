<script>
	import { handleOf } from '#lib/network/network.svelte.js';

	/** @type {{did: string}} */
	let { did } = $props();
	const handle = $derived(handleOf(did));
</script>

<jl-author><a href="/{handle}">@{handle}</a></jl-author>
