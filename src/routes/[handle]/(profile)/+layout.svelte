<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import NotFound from '#lib/components/NotFound.svelte';
	import DataState from '#lib/components/DataState.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { refused } from '#lib/atproto/xrpc.js';
	import { data } from '#lib/network/network.svelte.js';
	import ProfileHeader from '#lib/components/ProfileHeader.svelte';
	import PageMenu from '#lib/components/PageMenu.svelte';
	import ProfileTabs from '#lib/components/ProfileTabs.svelte';
	import { resolveDid } from '#lib/atproto/identity.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { setProfile } from '#lib/network/profile.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An account's pages: who it is, then its lists, the jobs it posted and the
	 * organizations it described, each a tab (/{handle}, /{handle}/jobs, /{handle}/companies).
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
	const handle = $derived(page.params.handle || '');
	/** undefined while it is resolved, null when it is not an account. @type {string | null | undefined} */
	let did = $state();
	// The server that resolves handles did not answer: nothing can be said of the account.
	let unreachable = $state(false);
	// An account the snapshot knows needs no request (and is shown offline).
	const known = $derived([...data.profiles.values()].find((p) => p.handle === handle)?.did);
	$effect(() => {
		const asked = handle;
		unreachable = false;
		if (known) {
			did = known;
			return;
		}
		did = undefined;
		resolveDid(asked)
			.then((found) => asked === handle && (did = found))
			.catch((err) => asked === handle && (refused(err) ? (did = null) : (unreachable = true)));
	});
	const self = $derived(Boolean(did) && session.did === did);

	setProfile({
		get handle() {
			return handle;
		},
		get did() {
			return did || undefined;
		},
		get self() {
			return self;
		}
	});
</script>

{#if unreachable}
	<DataState state="unreachable" />
{:else if did === null}
	<!-- Not an account: most often a mistyped page address. -->
	<NotFound title={t('notFound.title')} text={t('notFound.path', { path: `/${handle}` })} />
{:else}
	<jl-profile self={self || undefined}>
		<ProfileHeader did={did || undefined} {handle}>
			<menu>
				<!-- Signing out, the language, profiles: /menu. -->
				{#if self}<a href="/menu"><Icon name="menu" /> {t('nav.menu')}</a>{/if}
				<PageMenu />
			</menu>
		</ProfileHeader>
		{#if did}
			<ProfileTabs {handle} {did} {self} />
			<!-- Its lists, jobs and organizations are known once the data is: until then, it says why. -->
			<DataState>{@render children()}</DataState>
		{:else}
			<Pending />
		{/if}
	</jl-profile>
{/if}

<style>
	jl-profile {
		display: block;
	}
</style>
