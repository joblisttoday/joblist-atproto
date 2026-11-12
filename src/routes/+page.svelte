<script>
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import { goto } from '$app/navigation';
	import { session } from '#lib/auth/session.svelte.js';
	import { ownOrganization } from '#lib/network/own-organization.svelte.js';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import { keptTags } from '#lib/models/kept.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The home, Explore. Following no organization yet: what joblist is for, two doors (looking
	 * for work: paste an organization; hiring: publish your careers page), nothing to browse.
	 * Following some: the one box (a name, a website, a job board, a Bluesky list) and your
	 * organizations, by tag if chosen, each with its open jobs (or a way to find its board).
	 * Their jobs together are Jobs (/jobs). Signed in with an organization's domain and following
	 * nothing, its area is its home (/org); Menu › Browse jobs comes back here.
	 */
	const following = $derived(kept.list.length > 0);
	$effect(() => {
		if (session.ready && ownOrganization.own && !following) goto('/org', { replace: true });
	});
	const tags = $derived(keptTags(kept.list));
	let tag = $state('');
</script>

<svelte:head><title>{following ? `${t('nav.explore')} · ${config.name}` : `${config.name} · ${t('home.heading')}`}</title></svelte:head>

{#if following}
	<jl-explore-home>
		<h1>{t('nav.explore')}</h1>
		<QuickSearch inline placeholder={t('quick.placeholder.explore')} />
		<section aria-labelledby="home-organizations">
			<h2 id="home-organizations">{t('kept.title')}</h2>
			{#if tags.length}
				<menu aria-label={t('kept.tags')}>
					{#each tags as each (each)}
						<li><button type="button" aria-pressed={tag === each ? 'true' : 'false'} onclick={() => (tag = tag === each ? '' : each)}>{each}</button></li>
					{/each}
				</menu>
			{/if}
			<KeptOrganizations {tag} />
			<p><small>{t('curated.hint')}</small></p>
		</section>
	</jl-explore-home>
{:else}
	<jl-welcome>
		<h1>{t('home.heading')}</h1>
		<section aria-labelledby="welcome-seek">
			<h2 id="welcome-seek">{t('home.seek')}</h2>
			<QuickSearch inline placeholder={t('quick.placeholder.start')} />
			<p><small>{t('home.example')}</small></p>
			<p>{t('home.how')}</p>
		</section>
		<section aria-labelledby="welcome-hire">
			<h2 id="welcome-hire">{t('home.hire')}</h2>
			<p><a href="/org">{t('home.hire.link')} <Icon name="next" /></a></p>
		</section>
	</jl-welcome>
{/if}

<style>
	jl-explore-home {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	jl-explore-home section {
		margin-top: var(--space-l);
	}
	jl-explore-home h1 {
		margin: var(--space-m) 0;
	}
	jl-explore-home menu {
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: 0 0 var(--space-s);
	}
	jl-explore-home menu button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	jl-explore-home menu button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	/* A start page: one centered column, as wide as reading, a little down the screen. */
	jl-welcome {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-xl) 0;
	}
	jl-welcome h1 {
		margin: 0 0 var(--space-xl);
		text-align: center;
	}
	h2 {
		margin: 0 0 var(--space-s);
		font-size: var(--font-size-base);
	}
	section + section {
		margin-top: var(--space-xl);
		padding-top: var(--space-l);
		border-top: var(--border);
	}
	p {
		margin: var(--space-s) 0 0;
	}
	small {
		color: var(--color-muted);
	}
	@media (min-width: 48rem) {
		jl-welcome {
			padding-top: 14vh;
		}
		jl-welcome h1 {
			font-size: 2.5rem;
		}
	}
</style>
