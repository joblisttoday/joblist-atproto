<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CompanyPage from '#lib/components/CompanyPage.svelte';
	import OrganizationProfile from '#lib/components/OrganizationProfile.svelte';
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
	 * domain is its handle), in tabs (/{domain}, /{domain}/places). Else an account:
	 * who it is, then the jobs it posted (/{handle}): its own things, not its edits of others'.
	 * Else a domain: what this browser finds of it (its local profile). Else not found.
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
	const handle = $derived(page.params.handle || '');
	const company = $derived(data.companies.get(handle));
	// An organization's tab, from its address: /{domain}, /{domain}/places.
	const tab = $derived(/** @type {'jobs' | 'places'} */ (page.route.id?.endsWith('/places') ? 'places' : 'jobs'));
	// Tabs only an organization has: an account's page is not found there.
	const companyOnly = $derived(tab !== 'jobs');
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
		// Not a domain, not a DID: no account's handle, nothing to ask.
		if (!isDomain(asked) && !asked.startsWith('did:')) {
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
		<link rel="canonical" href="{config.url}/{company.key}{tab === 'jobs' ? '' : `/${tab}`}" />
	{:else}
		<link rel="canonical" href="{config.url}{page.url.pathname}" />
	{/if}
</svelte:head>

{#if company}
	<CompanyPage {company} {tab} />
{:else if did === undefined}
	<Pending />
{:else if companyOnly}
	<NotFound title={t('notFound.title')} text={t('notFound.path', { path: page.url.pathname })} />
{:else if domain && !posted}
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
		{@render children()}
	</jl-profile>
{/if}

<style>
	jl-profile {
		display: block;
	}
</style>
