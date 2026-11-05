<script>
	import config from '#lib/data/config.json';
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
	const mode = config.travel.mode;
	/** @type {'' | 'locating' | 'denied'} */
	let locating = $state('');

	// Asked only when the person wants jobs near them; kept in this page, never sent anywhere.
	function nearMe() {
		if (filters.near) {
			filters.near = null;
			onchange();
			return;
		}
		if (!navigator.geolocation) {
			locating = 'denied';
			return;
		}
		locating = 'locating';
		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				locating = '';
				filters.near = [coords.longitude, coords.latitude];
				onchange();
			},
			() => (locating = 'denied'),
			{ maximumAge: 600000, timeout: 15000 }
		);
	}
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
		<select bind:value={filters.remote} aria-label={t('jobs.filter.workplace')}>
			<option value="">{t('jobs.filter.workplace.any')}</option>
			<option value="remote">{t('jobs.filter.workplace.remote')}</option>
			<option value="anywhere">{t('jobs.filter.workplace.anywhere')}</option>
		</select>
		<fieldset>
			<button type="button" aria-pressed={filters.near ? 'true' : 'false'} onclick={nearMe} disabled={locating === 'locating'}>
				◎ {t('near.me')}
			</button>
			{#if filters.near}
				<select bind:value={filters.within} aria-label={t(`near.within.${mode}`, { minutes: '…' })}>
					<option value={0}>{t('near.any')}</option>
					{#each config.travel.minutes as minutes (minutes)}
						<option value={minutes}>{t(`near.within.${mode}`, { minutes })}</option>
					{/each}
				</select>
			{/if}
			<label><input type="checkbox" bind:checked={grouped} /> {t('jobs.filter.grouped')}</label>
		</fieldset>
		{#if locating === 'locating'}<small aria-live="polite">{t('near.locating')}</small>{/if}
		{#if locating === 'denied'}<small role="alert">{t('near.denied')}</small>{/if}
		{#if filters.near}<small>{t('near.private')}</small>{/if}
	</form>
</jl-job-filters>

<style>
	/* Stays in reach under the header while scrolling the results. */
	jl-job-filters {
		display: block;
		position: sticky;
		top: var(--header-height);
		z-index: 5;
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-s) var(--gutter);
		background: var(--color-bg);
		border-bottom: var(--border);
	}
	form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-s);
	}
	input[type='search']:first-child {
		grid-column: 1 / -1;
	}
	fieldset {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s) var(--space-m);
		margin: 0;
		padding: 0;
		border: 0;
	}
	fieldset select {
		width: auto;
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	small {
		grid-column: 1 / -1;
	}
	fieldset {
		grid-column: 1 / -1;
	}
</style>
