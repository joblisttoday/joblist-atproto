<script>
	import { FIELDS, fieldsOf } from '#lib/models/landing.js';
	import { offerCount } from '#lib/models/job.js';
	import { getLandingIndex } from '#lib/network/landing.js';
	import FilterChips from './FilterChips.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The fields jobs are in (engineering, design…), the largest first with how many open jobs
	 * each has, as chips: one tap shows only its jobs (filters.field, #field=… in the address),
	 * again shows them all. One row, swiped sideways on a phone.
	 * jobs: every job read; until they are, the counts of the small index the city and field
	 * pages use (each posting), then each offer once, as the list counts them.
	 * @type {{field?: string, jobs?: import('#lib/ats/job.js').Job[]}}
	 */
	let { field = $bindable(), jobs = [] } = $props();
	/** @type {Map<string, number>} */
	let indexed = $state.raw(new Map());
	getLandingIndex()
		.then((index) => (indexed = new Map((index?.fields || []).map((f) => [f.slug, f.count]))))
		.catch(() => {});
	const counts = $derived.by(() => {
		if (!jobs.length) return indexed;
		/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
		const by = new Map();
		for (const job of jobs) {
			for (const slug of fieldsOf({ t: job.title, d: job.department })) {
				const list = by.get(slug);
				if (list) list.push(job);
				else by.set(slug, [job]);
			}
		}
		return new Map([...by].map(([slug, list]) => [slug, offerCount(list)]));
	});
	const shown = $derived(FIELDS.map((f) => f.slug).sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0)));
</script>

<FilterChips label={t('explore.fields')} items={shown.map((slug) => ({ id: slug, label: t(`field.${slug}`), count: counts.get(slug) }))} bind:value={field} />
