<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{locations: import('#lib/models/company.js').Location[]}} */
	let { locations = $bindable() } = $props();
	const fields = /** @type {const} */ (['name', 'address', 'country', 'latitude', 'longitude']);
</script>

<jl-locations>
	<fieldset>
		<legend>{t('form.locations')}</legend>
		{#each locations as location, i (i)}
			<fieldset>
				{#each fields as field (field)}
					<label for="location-{i}-{field}">{t(`form.location.${field}`)}</label>
					<input
						id="location-{i}-{field}"
						bind:value={location[field]}
						inputmode={field === 'latitude' || field === 'longitude' ? 'decimal' : undefined}
					/>
				{/each}
				<menu>
					<button type="button" onclick={() => locations.splice(i, 1)}>{t('form.location.remove')}</button>
				</menu>
			</fieldset>
		{/each}
		<button type="button" onclick={() => locations.push({})}>{t('form.location.add')}</button>
	</fieldset>
</jl-locations>

<style>
	menu {
		display: flex;
		margin: var(--space-m) 0 0;
		padding: 0;
	}
</style>
