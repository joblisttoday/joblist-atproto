<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { browserCountry, currentPlace } from '#lib/navigation/location.js';
	import { delayed } from '#lib/navigation/delayed.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The explorer's search: what and where, then quick choices as chips.
	 * tools: shown at the end of the chips' row (how the jobs are shown).
	 * @type {{filters: import('#lib/models/job.js').JobFilters, places: string[], tools?: import('svelte').Snippet}}
	 */
	let { filters = $bindable(), places, tools } = $props();
	const id = $props.id();
	const mode = config.travel.mode;
	// Searching tens of thousands of jobs waits for a pause in typing.
	const query = delayed(() => filters.query, (value) => (filters.query = value), config.jobs.typingDelayMs);
	const where = delayed(() => filters.where, (value) => (filters.where = value), config.jobs.typingDelayMs);
	// Remote work is often limited to a country: offer the person's own.
	const country = $derived(browserCountry(i18n.locale));
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
		<!-- Each field keeps its name in sight, small on its edge: the placeholder is only an example. -->
		<jl-search-field>
			<label for="{id}-what">{t('explore.what')}</label>
			<input id="{id}-what" type="search" bind:value={query.value} placeholder={t('explore.what.example')} enterkeyhint="search" />
		</jl-search-field>
		<jl-search-field>
			<label for="{id}-where">{t('explore.where')}</label>
			<input
				id="{id}-where"
				type="search"
				bind:value={where.value}
				placeholder={t('explore.where.example')}
				list="{id}-places"
				enterkeyhint="search"
			/>
		</jl-search-field>
		<datalist id="{id}-places">
			{#each places as place (place)}<option value={place}></option>{/each}
		</datalist>
		<jl-explore-chips>
		<menu aria-label={t('jobs.filter.workplace')}>
			<li>
				<button type="button" aria-pressed={filters.near ? 'true' : 'false'} onclick={nearMe} disabled={locating === 'locating'}>
					<Icon name="near" /> {t('near.me')}
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
			{#if filters.area}
				<li>
					<button type="button" aria-pressed="true" onclick={() => (filters.area = null)}><Icon name="close" /> {t('explore.areaOn')}</button>
				</li>
			{/if}
			<li>
				<button
					type="button"
					aria-pressed={filters.remote ? 'true' : 'false'}
					onclick={() => (filters.remote = filters.remote ? '' : 'remote')}
				>
					<Icon name="remote" /> {t('jobs.filter.workplace.remote')}
				</button>
			</li>
			{#if filters.remote && !filters.where && country}
				<li>
					<button type="button" onclick={() => (filters.where = country.name)}>{t('explore.remoteFrom', { country: country.label })}</button>
				</li>
			{/if}
			<li>
				<button type="button" aria-pressed={filters.pay ? 'true' : 'false'} onclick={() => (filters.pay = !filters.pay)}>
					<Icon name="pay" /> {t('jobs.filter.pay')}
				</button>
			</li>
		</menu>
		{@render tools?.()}
		</jl-explore-chips>
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
	jl-explore-chips,
	small {
		grid-column: 1 / -1;
	}
	/* The chips, then the tools kept at the end of the same row. */
	jl-explore-chips {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-width: 0;
	}
	jl-explore-chips > menu {
		flex: 1;
		min-width: 0;
	}
	/* One line of chips, swiped sideways when they do not fit. */
	menu {
		flex-wrap: nowrap;
		margin: 0;
		gap: var(--space-xs);
		overflow-x: auto;
		scrollbar-width: none;
	}
	menu > li {
		flex: none;
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
	/* Wide screens: what, where and the chips on one row. */
	@media (min-width: 64rem) {
		form {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
		}
		jl-explore-chips {
			grid-column: auto;
		}
	}
</style>
