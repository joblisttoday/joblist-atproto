<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { isBuiltin, savedJobs } from '#lib/models/job-collection.js';
	import { removeJob } from '#lib/network/job-collections.svelte.js';
	import { ago } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The jobs of one collection (Applied, Hidden or a named one): each opens in the
	 * explorer, or leaves the collection.
	 * @type {{collection: import('#lib/models/job-collection.js').Collection}}
	 */
	let { collection } = $props();
	const list = $derived(savedJobs(collection));
	const kind = $derived(isBuiltin(collection.id) ? collection.id : 'named');
	const undo = $derived(kind === 'hidden' ? 'marks.unhide' : kind === 'applied' ? 'marks.remove' : 'collections.remove');
</script>

<jl-job-marks mark={kind}>
	{#if list.length}
		<ul>
			{#each list as [key, job] (key)}
				<li>
					<a href="/?{config.jobs.jobParam}={encodeURIComponent(job.url)}">
						<strong>{job.title}</strong>
						<small>{job.company} · {ago(Date.parse(job.at), i18n.locale)}</small>
					</a>
					<button type="button" onclick={() => removeJob(collection.id, key)}>
						<Icon name={kind === 'hidden' ? 'unhide' : 'close'} label={t(undo, { name: job.title })} />
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p>{t(`marks.none.${kind}`)}</p>
	{/if}
</jl-job-marks>

<style>
	jl-job-marks {
		display: block;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		border-bottom: var(--border);
	}
	a {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: var(--tap-size);
		padding: var(--space-s) 0;
		color: var(--color-fg);
		text-decoration: none;
	}
	small,
	p {
		color: var(--color-muted);
	}
	button {
		min-width: var(--tap-size);
		min-height: var(--tap-size);
		border: 0;
		background: none;
		color: var(--color-muted);
	}
</style>
