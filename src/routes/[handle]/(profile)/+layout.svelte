<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import NotFound from '#lib/components/NotFound.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import ProfileHeader from '#lib/components/ProfileHeader.svelte';
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
	$effect(() => {
		const asked = handle;
		did = undefined;
		resolveDid(asked)
			.then((found) => asked === handle && (did = found))
			.catch(() => asked === handle && (did = null));
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

{#if did === null}
	<!-- Not an account: most often a mistyped page address. -->
	<NotFound title={t('notFound.title')} text={t('notFound.path', { path: `/${handle}` })} />
{:else}
	<jl-profile self={self || undefined}>
		<ProfileHeader did={did || undefined} {handle}>
			{#if self}
				<!-- Signing out, the language, profiles: /settings. -->
				<menu><a href="/settings"><Icon name="settings" /> {t('settings.title')}</a></menu>
			{/if}
		</ProfileHeader>
		{#if did}
			<ProfileTabs {handle} {did} {self} />
			{@render children()}
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
