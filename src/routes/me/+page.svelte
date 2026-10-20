<script>
	import { goto } from '$app/navigation';
	import Pending from '#lib/components/Pending.svelte';
	import { session } from '#lib/auth/session.svelte.js';

	// "Me" is the signed-in person's profile: keep old /me links working.
	$effect(() => {
		if (!session.ready) return;
		if (session.handle) goto(`/${session.handle}`, { replace: true });
		else if (!session.did) goto('/signin', { replace: true });
	});
</script>

<Pending />
