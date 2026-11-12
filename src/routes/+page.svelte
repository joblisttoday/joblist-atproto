<script>
	import config from '#lib/data/config.json';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import OwnListItem from '#lib/components/OwnListItem.svelte';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import Row from '#lib/components/Row.svelte';
	import { keptTags } from '#lib/models/kept.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Home, the same for everyone. Following no organization yet: what joblist does, plainly,
	 * the box to start, and how it works, in four lines (organizations: sign in). Following
	 * some: the box (a name, a website, a job board, a Bluesky list), then what is new and
	 * yours, each a way into Explore: the new jobs of your searches (/jobs), your lists of jobs
	 * (/jobs/{id}), your tags (/companies#tag=…), the organizations followed last.
	 */
	const following = $derived(kept.list.length > 0);
	const tags = $derived(keptTags(kept.list).map((tag) => ({ tag, count: kept.list.filter((k) => k.tags?.includes(tag)).length })));
	const RECENT = 3;
</script>

<svelte:head><title>{following ? `${t('nav.home')} · ${config.name}` : `${config.name} · ${t('home.heading')}`}</title></svelte:head>

{#if following}
	<jl-home>
		<jl-visually-hidden><h1>{t('nav.home')}</h1></jl-visually-hidden>
		<QuickSearch inline legend={t('quick.legend')} placeholder={t('quick.placeholder.explore')} />

		{#if searches.list.length}
			<section aria-labelledby="home-new">
				<h2 id="home-new">{t('home.new.title')}</h2>
				<Row href="/jobs" icon="search" title={t('home.new', { count: savedJobs.fresh })} meta={[t('home.new.searches', { count: searches.list.length })]} />
			</section>
		{/if}

		<section aria-labelledby="home-lists">
			<h2 id="home-lists">{t('me.lists.title')}</h2>
			<ul>
				{#each own.lists as list (list.id)}<li><OwnListItem {list} /></li>{/each}
			</ul>
		</section>

		{#if tags.length}
			<section aria-labelledby="home-tags">
				<h2 id="home-tags">{t('kept.tags')}</h2>
				<ul>
					{#each tags as { tag, count } (tag)}
						<li><Row href="/companies#tag={encodeURIComponent(tag)}" icon="lists" title={tag} meta={[t('home.tag.count', { count })]} /></li>
					{/each}
				</ul>
			</section>
		{/if}

		<section aria-labelledby="home-recent">
			<h2 id="home-recent">{t('home.recent')}</h2>
			<KeptOrganizations max={RECENT} />
			{#if kept.list.length > RECENT}<p><a href="/companies">{t('home.recent.all', { count: kept.list.length })}</a></p>{/if}
		</section>
	</jl-home>
{:else}
	<jl-welcome>
		<h1>{t('home.heading')}</h1>
		<QuickSearch inline legend={t('home.start')} placeholder={t('quick.placeholder.explore')} />
		<p><small>{t('home.example')}</small></p>
		<section aria-labelledby="welcome-how">
			<h2 id="welcome-how">{t('home.how.title')}</h2>
			<ol>
				<li>{t('home.how.follow')}</li>
				<li>{t('home.how.jobs')}</li>
				<li>{t('home.how.private')}</li>
				<li>{t('home.how.orgs')} <a href="/signin">{t('nav.signin')}</a></li>
			</ol>
		</section>
	</jl-welcome>
{/if}

<style>
	jl-home {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-s) 0 var(--space-xl);
	}
	jl-home section {
		margin-top: var(--space-l);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	/* A start page: one centered column, as wide as reading, a little down the screen. */
	jl-welcome {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-xl) 0;
	}
	jl-welcome h1 {
		margin: 0 0 var(--space-l);
	}
	ol {
		margin: 0;
		padding-inline-start: var(--space-l);
		list-style: decimal;
	}
	li + li {
		margin-top: var(--space-xs);
	}
	h2 {
		margin: 0 0 var(--space-s);
		font-size: var(--font-size-base);
	}
	jl-welcome section {
		margin-top: var(--space-xl);
	}
	p {
		margin: var(--space-s) 0 0;
	}
	small {
		color: var(--color-muted);
	}
</style>
