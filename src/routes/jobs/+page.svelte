<script>
	import { goto } from '$app/navigation';

	// Jobs is the home now: a link to /jobs#q=… opens it there, as it was (after the "#" too).
	goto(`/${location.search}${location.hash}`, { replace: true });
</script>
