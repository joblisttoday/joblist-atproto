<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CompanyPage from '#lib/components/CompanyPage.svelte';
	import DeviceProfile from '#lib/components/DeviceProfile.svelte';
	import { device } from '#lib/local/device.svelte.js';
	import OrganizationProfile from '#lib/components/OrganizationProfile.svelte';
	import OrganizationSetup from '#lib/components/OrganizationSetup.svelte';
	import { isDomain, keptUrl, keyOf } from '#lib/models/kept.js';
	import NotFound from '#lib/components/NotFound.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { data, lookup } from '#lib/network/network.svelte.js';
	import ProfileHeader from '#lib/components/ProfileHeader.svelte';
	import PageMenu from '#lib/components/PageMenu.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { setProfile } from '#lib/network/profile.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A domain's page, joblist.today/{domain}: a handle is a domain, and an organization is known
	 * by its domain. An organization joblist knows: its page (with its Bluesky account when the
	 * domain is its handle), one page (/{domain}). Else an account:
	 * who it is, then the jobs it posted (/{handle}): its own things, not its edits of others'.
	 * Else a domain: what this browser finds of it (its local profile). Else not found.
	 * This device's own profile is /{name}.local (DeviceProfile): the same view, private.
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
	const handle = $derived(page.params.handle || '');
	const company = $derived(data.companies.get(handle));
	// Tabs only an organization has: an account's page is not found there.
	// The same organization added twice: its page is the kept one's.
	$effect(() => {
		if (company && company.key !== handle) goto(`/${company.key}`, { replace: true });
	});
	// A domain (acme.org): its local profile when it is neither an organization nor an account.
	// Only a real one: test.env, llms.txt or fake.no-tld are no organization's (isDomain).
	const domain = $derived.by(() => {
		const link = isDomain(handle) ? keptUrl(handle) : null;
		return link && keyOf(link) === handle ? link : '';
	});
	/** undefined while it is looked up, null when it is no account. @type {string | null | undefined} */
	let did = $state();
	// Its own account, its organization record and its job offers, read from its server (lookup).
	$effect(() => {
		const asked = handle;
		// Not a domain, not a DID (a .local name is this device's): no account's handle, nothing to ask.
		if ((!isDomain(asked) && !asked.startsWith('did:')) || asked.endsWith('.local')) {
			did = null;
			return;
		}
		did = undefined;
		lookup(asked).then((found) => asked === handle && (did = found));
	});
	// An account that posted job offers: its page lists them; a domain that did not, what a browser finds of it.
	const posted = $derived(Boolean(did) && data.posts.some((p) => p.did === did));
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

<!-- Its own address: the page served for every domain and handle has none (site/site.js). -->
<svelte:head>
	{#if company}
		<title>{company.name} · {config.name}</title>
		<link rel="canonical" href="{config.url}/{company.key}" />
	{:else}
		<link rel="canonical" href="{config.url}{page.url.pathname}" />
	{/if}
</svelte:head>

{#if handle.endsWith('.local')}
	{#if handle === `${device.name}.local`}<DeviceProfile />{:else}<NotFound title={t('notFound.title')} text={t('notFound.path', { path: `/${handle}` })} />{/if}
{:else if company}
	<CompanyPage {company} />
{:else if did === undefined}
	<Pending />
{:else if domain && !posted}
	<OrganizationProfile link={domain} />
	<!-- Its own, not described yet: what to do, under what visitors see now. -->
	{#if self}<OrganizationSetup />{/if}
{:else if did === null}
	<!-- Not an account: most often a mistyped page address. -->
	<NotFound title={t('notFound.title')} text={t('notFound.path', { path: `/${handle}` })} />
{:else}
	<jl-profile self={self || undefined}>
		<ProfileHeader did={did || undefined} {handle}>
			<menu>
				<!-- Its own: describing it (/{handle}/edit). -->
				{#if self}<a href="/{handle}/edit"><Icon name="edit" /> {t('orgs.describe')}</a>{/if}
				<PageMenu />
			</menu>
		</ProfileHeader>
		{@render children()}
		{#if self}<OrganizationSetup />{/if}
	</jl-profile>
{/if}

<style>
	jl-profile {
		display: block;
	}
</style>
