<script>
	import config from '#lib/data/config.json';
	import Explore from '#lib/components/Explore.svelte';
	import ExploreTabs from '#lib/components/ExploreTabs.svelte';
	import ListChips from '#lib/components/ListChips.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('nav.jobs')} · {config.name}</title></svelte:head>

<jl-visually-hidden><h1>{t('nav.jobs')}</h1></jl-visually-hidden>

<!-- The jobs of the organizations followed: search, filters, view and the job open after the "#" (/jobs#q=design&where=Berlin); above, Explore's switch and your lists. -->
<Explore path="/jobs">
	{#snippet top()}<ExploreTabs /><ListChips />{/snippet}
</Explore>
