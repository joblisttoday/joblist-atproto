<script>
	import Redirect from '#lib/components/Redirect.svelte';
	import { page } from '$app/state';
</script>

<!-- A list of jobs is /saved/{id}. -->
<Redirect to={`/saved/${page.params.id}`} />
