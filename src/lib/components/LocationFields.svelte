<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{locations: import('#lib/models/company.js').Location[]}} */
	let { locations = $bindable() } = $props();
	const text = /** @type {const} */ (['name', 'address', 'country']);
	const coordinates = /** @type {const} */ (['latitude', 'longitude']);
</script>

<jl-locations>
	<fieldset>
		<legend>{t('form.locations')}</legend>
		{#each locations as location, i (i)}
			<fieldset>
				<legend>{location.name || t('form.location', { number: i + 1 })}</legend>
				{#each text as field (field)}
					<label for="location-{i}-{field}">{t(`form.location.${field}`)}</label>
					<input id="location-{i}-{field}" bind:value={location[field]} />
				{/each}
				<jl-coordinates>
					{#each coordinates as field (field)}
						<span>
							<label for="location-{i}-{field}">{t(`form.location.${field}`)}</label>
							<input id="location-{i}-{field}" bind:value={location[field]} inputmode="decimal" />
						</span>
					{/each}
				</jl-coordinates>
				<menu>
					<button type="button" onclick={() => locations.splice(i, 1)}>{t('form.location.remove')}</button>
				</menu>
			</fieldset>
		{/each}
		<button type="button" onclick={() => locations.push({})}>+ {t('form.location.add')}</button>
	</fieldset>
</jl-locations>

<style>
	jl-coordinates {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-s);
	}
	menu {
		margin: var(--space-m) 0 0;
	}
	fieldset fieldset {
		padding: var(--space-xs) var(--space-s) var(--space-s);
	}
</style>
