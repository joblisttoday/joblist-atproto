<script>
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What a page shows from joblist's data, only once there is data to show: before, it says
	 * why there is nothing yet (being read, or unreachable and why), so an empty page never
	 * stands for an empty result. state: this page's own file, when it reads one (a city's page),
	 * else the network's (network.status).
	 * @type {{state?: 'reading' | 'known' | 'unreachable', children?: import('svelte').Snippet}}
	 */
	let { state, children } = $props();
	const now = $derived(state ?? data.status);
	const offline = $derived(typeof navigator !== 'undefined' && navigator.onLine === false);
</script>

{#if now === 'known'}
	{@render children?.()}
{:else if now === 'reading'}
	<jl-data-state state="reading" role="status">
		<progress aria-label={t('network.loading')}></progress>
		<p>{t('network.loading')}</p>
	</jl-data-state>
{:else}
	<jl-data-state state="unreachable" role="alert">
		<p><strong>{t(offline ? 'data.offline' : 'data.unreachable')}</strong></p>
		<p>{t('data.kept')}</p>
		<menu>
			<button type="button" onclick={() => location.reload()}>{t('network.retry')}</button>
			<a href="/me">{t('nav.me')}</a>
		</menu>
	</jl-data-state>
{/if}

<style>
	jl-data-state {
		display: block;
		margin: var(--space-m) 0;
		padding: var(--space-m);
		border: var(--border-dashed);
		border-radius: var(--radius);
	}
	jl-data-state[state='reading'] {
		border: 0;
		padding-inline: 0;
	}
	p {
		margin: 0 0 var(--space-s);
	}
	/* Only what went wrong is said as an alert; what is still there, plainly. */
	jl-data-state[state='unreachable'] p + p {
		color: var(--color-fg);
	}
	jl-data-state[state='reading'] p {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	progress {
		width: 100%;
	}
</style>
