<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { locationLabel, samePlace } from '#lib/models/place-search.js';
	import { searchPlaces } from '#lib/network/place-search.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Places, added in a tap: the ones suggested (a company's offices), or a city
	 * found as one types, with where it is filled in. Each can still be written by hand.
	 * @type {{locations: import('#lib/models/company.js').Location[], suggested?: import('#lib/models/company.js').Location[]}}
	 */
	let { locations = $bindable(), suggested = [] } = $props();
	const id = $props.id();
	const text = /** @type {const} */ (['name', 'address', 'country']);
	const coordinates = /** @type {const} */ (['latitude', 'longitude']);

	const offered = $derived(suggested.filter((s) => s.name && !locations.some((l) => samePlace(l, s))));
	let query = $state('');
	/** @type {import('#lib/models/place-search.js').FoundPlace[]} */
	let found = $state.raw([]);
	let searching = $state(false);
	/** The place written by hand, open to edit. */
	let editing = $state(-1);

	// Search once typing pauses; a newer search cancels the one before.
	$effect(() => {
		const words = query.trim();
		if (words.length < config.placeSearch.minLength) {
			found = [];
			return;
		}
		const controller = new AbortController();
		const timer = setTimeout(() => {
			searching = true;
			searchPlaces(words, i18n.locale, controller.signal)
				.then((places) => (found = places))
				.catch(() => {})
				.finally(() => (searching = false));
		}, config.placeSearch.delayMs);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	});

	/** @param {import('#lib/models/company.js').Location} location */
	function add(location) {
		if (!locations.some((l) => samePlace(l, location))) locations.push({ ...location });
		query = '';
		found = [];
	}

	function addByHand() {
		locations.push({});
		editing = locations.length - 1;
	}
</script>

<jl-locations>
	<fieldset>
		<legend>{t('form.locations')}</legend>
		{#if locations.length}
			<ul>
				{#each locations as location, i (i)}
					<li>
						<details open={editing === i || undefined}>
							<summary>
								<Icon name="place" />
								{locationLabel(location) || t('form.location', { number: i + 1 })}
								{#if location.latitude && location.longitude}<small>{t('form.location.onMap')}</small>{/if}
							</summary>
							{#each text as field (field)}
								<label for="{id}-{i}-{field}">{t(`form.location.${field}`)}</label>
								<input id="{id}-{i}-{field}" bind:value={location[field]} />
							{/each}
							<jl-coordinates>
								{#each coordinates as field (field)}
									<span>
										<label for="{id}-{i}-{field}">{t(`form.location.${field}`)}</label>
										<input id="{id}-{i}-{field}" bind:value={location[field]} inputmode="decimal" />
									</span>
								{/each}
							</jl-coordinates>
						</details>
						<button type="button" onclick={() => locations.splice(i, 1)}>
							<Icon name="close" label={t('form.location.removeOne', { name: locationLabel(location) || t('form.location', { number: i + 1 }) })} />
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		{#if offered.length}
			<p><small>{t('form.location.suggested')}</small></p>
			<menu>
				{#each offered as place (locationLabel(place))}
					<li><button type="button" onclick={() => add(place)}><Icon name="add" /> {locationLabel(place)}</button></li>
				{/each}
			</menu>
		{/if}

		<label for="{id}-search">{t('form.location.search')}</label>
		<input
			id="{id}-search"
			type="search"
			bind:value={query}
			placeholder={t('form.location.search.placeholder')}
			autocomplete="off"
			enterkeyhint="search"
			onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), found[0] && add(found[0].location))}
		/>
		{#if found.length}
			<ul aria-label={t('form.location.found')}>
				{#each found as place (place.label)}
					<li><button type="button" onclick={() => add(place.location)}><Icon name="place" /> {place.label}</button></li>
				{/each}
			</ul>
		{:else if searching}
			<p aria-live="polite"><small>{t('form.location.searching')}</small></p>
		{/if}
		<p><button type="button" onclick={addByHand}>{t('form.location.byHand')}</button></p>
	</fieldset>
</jl-locations>

<style>
	ul {
		margin: var(--space-xs) 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: flex-start;
		gap: var(--space-xs);
		border-bottom: var(--border);
	}
	details {
		flex: 1;
		min-width: 0;
	}
	summary {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: var(--tap-size);
		cursor: pointer;
	}
	summary small {
		margin-inline-start: auto;
		color: var(--color-muted);
	}
	li > button {
		min-width: var(--tap-size);
		border: 0;
		background: none;
		color: var(--color-muted);
	}
	/* Found places: the whole row is the button. */
	ul[aria-label] li {
		display: block;
	}
	ul[aria-label] button {
		justify-content: flex-start;
		width: 100%;
		border: 0;
		border-radius: 0;
		background: none;
		text-align: start;
	}
	menu {
		margin: var(--space-xs) 0;
	}
	menu button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	p {
		margin: var(--space-s) 0 0;
	}
	p > button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border: 0;
		background: none;
		text-decoration: underline;
		font-size: var(--font-size-small);
	}
	jl-coordinates {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-s);
		padding-bottom: var(--space-s);
	}
</style>
