<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CompanyPage from '#lib/components/CompanyPage.svelte';
	import OrganizationProfile from '#lib/components/OrganizationProfile.svelte';
	import { isDomain, keptUrl, keyOf } from '#lib/models/kept.js';
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
	 * A domain's page, joblist.today/{domain}: a handle is a domain, and an organization is known
	 * by its domain. An organization joblist knows: its page (with its Bluesky account when the
	 * domain is its handle), in tabs (/{domain}, /{domain}/places, /{domain}/history). Else an account: who it is, then the organizations it described
	 * and the jobs it posted, each a tab (/{handle}, /{handle}/jobs).
	 * Else a domain: what this browser finds of it (its local profile). Else not found.
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
	const handle = $derived(page.params.handle || '');
	const company = $derived(data.companies.get(handle));
	// An organization's tab, from its address: /{domain}, /{domain}/places, /{domain}/history.
	const tab = $derived(/** @type {'jobs' | 'places' | 'history'} */ (page.route.id?.endsWith('/places') ? 'places' : page.route.id?.endsWith('/history') ? 'history' : 'jobs'));
	// Tabs only an organization has: an account's page is not found there.
	const companyOnly = $derived(tab !== 'jobs');
	// The same organization added twice: its page is the kept one's.
	$effect(() => {
		if (company && company.key !== handle) goto(`/${company.key}`, { replace: true });
		// An organization's jobs are its page itself.
		else if (company && page.route.id?.endsWith('/jobs')) goto(`/${company.key}${location.hash}`, { replace: true });
	});
	// A domain (acme.org): its local profile when it is neither an organization nor an account.
	// Only a real one: test.env, llms.txt or fake.no-tld are no organization's (isDomain).
	const domain = $derived.by(() => {
		const link = isDomain(handle) ? keptUrl(handle) : null;
		return link && keyOf(link) === handle ? link : '';
	});
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
		// Not a domain, not a DID: no account's handle, nothing to ask.
		if (!isDomain(asked) && !asked.startsWith('did:')) {
			did = null;
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

<!-- Its own address: the page served for every domain and handle has none (indexer/site.js). -->
<svelte:head>
	{#if company}
		<title>{company.name} · {config.name}</title>
		<link rel="canonical" href="{config.url}/{company.key}{tab === 'jobs' ? '' : `/${tab}`}" />
	{:else}
		<link rel="canonical" href="{config.url}{page.url.pathname}" />
	{/if}
</svelte:head>

{#if company}
	<CompanyPage {company} {tab} />
{:else if data.status !== 'known'}
	<DataState />
{:else if unreachable}
	<DataState state="unreachable" />
{:else if companyOnly}
	<NotFound title={t('notFound.title')} text={t('notFound.path', { path: page.url.pathname })} />
{:else if did === null && domain}
	<OrganizationProfile link={domain} />
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
			<!-- Its organizations and jobs are known once the data is: until then, it says why. -->
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
