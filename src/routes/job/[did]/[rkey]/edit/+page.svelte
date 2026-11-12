<script>
	import Redirect from '#lib/components/Redirect.svelte';
	import { page } from '$app/state';
</script>

<!-- Editing an offer is /org/jobs/{rkey}. -->
<Redirect to={`/org/jobs/${page.params.rkey}`} />
