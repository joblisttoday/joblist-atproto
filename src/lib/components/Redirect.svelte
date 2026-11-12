<script>
	import { goto } from '$app/navigation';

	/**
	 * An old address, kept working: on to its new one, with what follows the "?" and the "#"
	 * (a search, a link to open), which a load function never sees.
	 * @type {{to: string}}
	 */
	let { to } = $props();
	$effect(() => {
		goto(`${to}${location.search}${location.hash}`, { replace: true });
	});
</script>
