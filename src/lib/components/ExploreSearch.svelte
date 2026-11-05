<script>
	import config from '#lib/data/config.json';
	import { currentPlace } from '#lib/navigation/location.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The explorer's search: what and where, then quick choices as chips.
	 * @type {{filters: import('#lib/models/job.js').JobFilters, places: string[]}}
	 */
	let { filters = $bindable(), places } = $props();
	const id = $props.id();
	const mode = config.travel.mode;
	/** @type {'' | 'locating' | 'denied'} */
	let locating = $state('');

	function nearMe() {
		if (filters.near) {
			filters.near = null;
			return;
		}
		locating = 'locating';
		currentPlace().then(
			(point) => {
				locating = '';
				filters.near = point;
				if (!filters.within) filters.within = config.travel.minutes[1];
			},
			() => (locating = 'denied')
		);
	}
</script>

<jl-explore-search>
	<form role="search" onsubmit={(e) => e.preventDefault()}>
		<input
			type="search"
			bind:value={filters.query}
			placeholder={t('explore.what')}
			aria-label={t('jobs.filter.what')}
			enterkeyhint="search"
		/>
		<input
			type="search"
			bind:value={filters.where}
			placeholder={t('explore.where')}
			aria-label={t('jobs.filter.where')}
			list="{id}-places"
			enterkeyhint="search"
		/>
		<datalist id="{id}-places">
			{#each places as place (place)}<option value={place}></option>{/each}
		</datalist>
		<menu aria-label={t('jobs.filter.workplace')}>
			<li>
				<button type="button" aria-pressed={filters.near ? 'true' : 'false'} onclick={nearMe} disabled={locating === 'locating'}>
					◎ {t('near.me')}
				</button>
			</li>
			{#if filters.near}
				<li>
					<select bind:value={filters.within} aria-label={t(`near.within.${mode}`, { minutes: '…' })}>
						<option value={0}>{t('near.any')}</option>
						{#each config.travel.minutes as minutes (minutes)}
							<option value={minutes}>{t(`near.within.${mode}`, { minutes })}</option>
						{/each}
					</select>
				</li>
			{/if}
			<li>
				<button
					type="button"
					aria-pressed={filters.remote ? 'true' : 'false'}
					onclick={() => (filters.remote = filters.remote ? '' : 'remote')}
				>
					{t('jobs.filter.workplace.remote')}
				</button>
			</li>
		</menu>
		{#if locating === 'locating'}<small aria-live="polite">{t('near.locating')}</small>{/if}
		{#if locating === 'denied'}<small role="alert">{t('near.denied')}</small>{/if}
	</form>
</jl-explore-search>

<style>
	form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-s);
	}
	menu,
	small {
		grid-column: 1 / -1;
	}
	menu {
		margin: 0;
		gap: var(--space-xs);
	}
	/* Chips: small, round, filled when on. */
	menu button,
	menu select {
		width: auto;
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	menu button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
