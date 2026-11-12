<script>
	import config from '#lib/data/config.json';
	import Explore from '#lib/components/Explore.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import { kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The home. Following no organization yet: what joblist is for, two doors (looking for
	 * work: paste an organization; hiring: publish your careers page), nothing to browse.
	 * Following some: Jobs, their open jobs, searched (/#q=design&where=Berlin), your saved
	 * searches as chips.
	 */
	const following = $derived(kept.list.length > 0);
</script>

<svelte:head><title>{following ? `${t('nav.jobs')} · ${config.name}` : `${config.name} · ${t('home.heading')}`}</title></svelte:head>

{#if following}
	<jl-visually-hidden><h1>{t('nav.jobs')}</h1></jl-visually-hidden>
	<Explore path="/" />
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
			<p><a href="/organization">{t('home.hire.link')} <Icon name="next" /></a></p>
		</section>
	</jl-welcome>
{/if}

<style>
	/* A start page: one centered column, as wide as reading, a little down the screen. */
	jl-welcome {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-xl) 0;
	}
	h1 {
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
		h1 {
			font-size: 2.5rem;
		}
	}
</style>
