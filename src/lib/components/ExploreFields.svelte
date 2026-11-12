<script>
	import config from '#lib/data/config.json';
	import { offerCount } from '#lib/models/job.js';
	import { teamsOf } from '#lib/models/team.js';
	import FilterChips from './FilterChips.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The teams the jobs are in, from their boards' own departments (models/team.js), the
	 * largest first with how many open jobs each has, as chips: one tap shows only its jobs
	 * (filters.field, #field=… in the address), again shows them all. One row, swiped sideways
	 * on a phone. None when the boards say no department.
	 * jobs: every job read, each offer counted once, as the list counts them.
	 * @type {{field?: string, jobs?: import('#lib/ats/job.js').Job[]}}
	 */
	let { field = $bindable(), jobs = [] } = $props();
	const teams = $derived(teamsOf(jobs, offerCount).slice(0, config.jobs.teamsShown));
</script>

{#if teams.length > 1}
	<FilterChips label={t('explore.fields')} items={teams} bind:value={field} />
{/if}
