<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * @type {{
	 *   filters: import('#lib/models/job.js').JobFilters,
	 *   grouped: boolean,
	 *   places: string[],
	 *   onchange: () => void
	 * }}
	 */
	let { filters = $bindable(), grouped = $bindable(), places, onchange } = $props();
	const id = $props.id();
</script>

<jl-job-filters>
	<form role="search" oninput={onchange} onchange={onchange} onsubmit={(e) => e.preventDefault()}>
		<input
			type="search"
			bind:value={filters.query}
			placeholder={t('jobs.filter.what')}
			aria-label={t('jobs.filter.what')}
			enterkeyhint="search"
		/>
		<input
			type="search"
			bind:value={filters.where}
			placeholder={t('jobs.filter.where')}
			aria-label={t('jobs.filter.where')}
			list="{id}-places"
			enterkeyhint="search"
		/>
		<datalist id="{id}-places">
			{#each places as place (place)}<option value={place}></option>{/each}
		</datalist>
		<fieldset>
			<label><input type="checkbox" bind:checked={filters.remote} /> {t('jobs.filter.remote')}</label>
			<label><input type="checkbox" bind:checked={grouped} /> {t('jobs.filter.grouped')}</label>
		</fieldset>
	</form>
</jl-job-filters>

<style>
	form {
		display: grid;
		gap: var(--space-s);
	}
	fieldset {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--space-l);
		margin: 0;
		padding: 0;
		border: 0;
	}
	@media (min-width: 48rem) {
		form {
			grid-template-columns: 1fr 1fr;
		}
		fieldset {
			grid-column: 1 / -1;
		}
	}
</style>
