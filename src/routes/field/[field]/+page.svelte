<script>
	import { page } from '$app/state';
	import LandingPage from '#lib/components/LandingPage.svelte';

	const params = $derived(/** @type {Record<string, string | undefined>} */ (page.params));
</script>

<!-- Its HTML comes from the Worker (worker/), fresh from the snapshot; the app shows the same. -->
{#key params.field}<LandingPage field={params.field} />{/key}
