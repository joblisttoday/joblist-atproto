<script>
	import { tick } from 'svelte';
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { locationLabel, samePlace, searchPlaces } from '#lib/places.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Places, added in a tap: the ones suggested (the organization's), or one found as it is
	 * typed (OpenStreetMap), with where it is on the map filled in; each can still be written
	 * by hand.
	 * @type {{locations: import('#lib/places.js').Location[], suggested?: import('#lib/places.js').Location[], legend?: string}}
	 */
	let { locations = $bindable(), suggested = [], legend = '' } = $props();
	const id = $props.id();
	const text = /** @type {const} */ (['name', 'address', 'country']);
	const coordinates = /** @type {const} */ (['latitude', 'longitude']);

	const offered = $derived(suggested.filter((s) => locationLabel(s) && !locations.some((l) => samePlace(l, s))));
	let query = $state('');
	/** @type {import('#lib/places.js').FoundPlace[]} */
	let found = $state.raw([]);
	let searching = $state(false);
	let searched = $state(false);
	/** A place just added, said to screen readers. */
	let added = $state('');
	/** The place written by hand, open to edit. */
	let editing = $state(-1);
	/** @type {HTMLInputElement | undefined} */
	let search = $state();

	// Search once typing pauses; a newer search cancels the one before.
	$effect(() => {
		const words = query.trim();
		searched = false;
		if (words.length < config.placeSearch.minLength) {
			found = [];
			return;
		}
		added = '';
		const controller = new AbortController();
		const timer = setTimeout(() => {
			searching = true;
			searchPlaces(words, i18n.locale, controller.signal)
				.then((places) => ((found = places), (searched = true)))
				.catch(() => {})
				.finally(() => (searching = false));
		}, config.placeSearch.delayMs);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	});

	const said = $derived(
		searching ? t('form.location.searching') : searched ? t('form.location.foundCount', { count: found.length }) : added ? t('form.location.added', { name: added }) : ''
	);

	/** @param {import('#lib/places.js').Location} location */
	function add(location) {
		if (!locations.some((l) => samePlace(l, location))) locations.push({ ...location });
		added = locationLabel(location);
		query = '';
		found = [];
		tick().then(() => search?.focus());
	}

	/** @param {number} i */
	function remove(i) {
		locations.splice(i, 1);
		if (editing >= locations.length) editing = -1;
		tick().then(() => search?.focus());
	}

	function byHand() {
		locations.push({});
		editing = locations.length - 1;
	}
</script>

<fieldset>
	<legend>{legend || t('form.locations')}</legend>
	{#if locations.length}
		<ul>
			{#each locations as location, i (i)}
				<li>
					<details open={editing === i || undefined}>
						<summary>
							<Icon name="place" />
							<span>{locationLabel(location) || t('form.location', { number: i + 1 })}</span>
							{#if location.latitude && location.longitude}<small>{t('form.location.onMap')}</small>{/if}
						</summary>
						{#each text as field (field)}
							<label for="{id}-{i}-{field}">{t(`form.location.${field}`)}</label>
							<input id="{id}-{i}-{field}" bind:value={location[field]} />
						{/each}
						<div>
							{#each coordinates as field (field)}
								<span>
									<label for="{id}-{i}-{field}">{t(`form.location.${field}`)}</label>
									<input id="{id}-{i}-{field}" bind:value={location[field]} inputmode="decimal" />
								</span>
							{/each}
						</div>
					</details>
					<button type="button" data-remove aria-label={t('form.location.removeOne', { name: locationLabel(location) || t('form.location', { number: i + 1 }) })} onclick={() => remove(i)}>
						<Icon name="close" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if offered.length}
		<p><small>{t('form.location.suggested')}</small></p>
		<menu>
			{#each offered as place, i (i)}
				<li><button type="button" data-chip onclick={() => add(place)}><Icon name="post" />{locationLabel(place)}</button></li>
			{/each}
		</menu>
	{/if}

	<label for="{id}-search">{t('form.location.search')}</label>
	<div data-search>
		<Icon name="search" />
		<input
			id="{id}-search"
			bind:this={search}
			type="search"
			bind:value={query}
			placeholder={t('form.location.search.placeholder')}
			autocomplete="off"
			enterkeyhint="search"
			onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), found[0] && add(found[0].location))}
		/>
	</div>
	{#if found.length}
		<ul data-found aria-label={t('form.location.found')}>
			{#each found as place, i (`${i}:${place.label}`)}
				<li><button type="button" onclick={() => add(place.location)}><Icon name="place" />{place.label}</button></li>
			{/each}
		</ul>
	{/if}
	<p role="status"><small>{said}</small></p>
	<p><button type="button" data-link onclick={byHand}>{t('form.location.byHand')}</button></p>
</fieldset>

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: var(--space-s);
		padding: 0;
		font-weight: var(--font-weight-strong);
	}
	ul {
		margin: 0 0 var(--space-m);
		padding: 0;
		list-style: none;
		border: var(--border);
		border-radius: var(--radius-large);
	}
	ul > li {
		display: flex;
		align-items: flex-start;
		gap: var(--space-xs);
		padding-inline: var(--space-m) var(--space-xs);
	}
	ul > li + li {
		border-top: var(--border);
	}
	details {
		flex: 1;
		min-width: 0;
		padding-bottom: var(--space-xs);
	}
	details:not([open]) {
		padding-bottom: 0;
	}
	summary {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary span {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	summary small {
		color: var(--color-muted);
	}
	details label {
		display: block;
		margin-top: var(--space-s);
		font-size: var(--font-size-small);
	}
	details div {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-s);
	}
	[data-remove] {
		flex: none;
		width: var(--tap-size);
		min-height: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-muted);
	}
	menu {
		margin: var(--space-xs) 0 var(--space-m);
	}
	[data-chip] {
		gap: var(--space-xs);
		font-size: var(--font-size-small);
		--icon-size: 1rem;
	}
	/* The search: as joblist's other boxes, its icon inside. */
	[data-search] {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		padding-inline: var(--space-m);
		border: var(--control-border);
		border-radius: var(--radius-round);
		color: var(--color-muted);
	}
	[data-search]:focus-within {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
	[data-search] input {
		flex: 1;
		min-width: 0;
		min-height: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-fg);
	}
	[data-search] input:focus {
		outline: none;
	}
	fieldset > label {
		display: block;
		margin-bottom: var(--space-s);
		font-weight: var(--font-weight-strong);
	}
	[data-found] {
		margin-top: var(--space-xs);
	}
	[data-found] button {
		justify-content: flex-start;
		gap: var(--space-s);
		width: 100%;
		border: 0;
		border-radius: 0;
		background: none;
		font-weight: normal;
		text-align: start;
	}
	[data-found] li {
		padding: 0;
	}
	[data-found] button:hover {
		background: var(--color-soft);
	}
	p {
		margin: var(--space-xs) 0 0;
	}
	[data-link] {
		min-height: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		font-size: var(--font-size-small);
		font-weight: normal;
		text-decoration: underline;
	}
</style>
