<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * How to take part in an organization besides its jobs: volunteer, join, fund, contribute.
	 * Each goes where the organization says (on its own site), or says what it is.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
	// The kinds known (config.companyForm.contributeKinds) are icons' names too.
	const iconOf = (/** @type {string} */ kind) => /** @type {import('#lib/icons.js').IconName} */ (kind);
</script>

{#if company.contribute.length}
	<section aria-labelledby="company-contribute">
		<h2 id="company-contribute">{t('company.contribute')}</h2>
		<ul>
			{#each company.contribute as way, i (i)}
				<li>
					{#if way.url}
						<a href={way.url} target="_blank" rel="noopener">
							<Icon name={iconOf(way.kind)} />
							<span><strong>{t(`contribute.${way.kind}`)}</strong>{#if way.text}<small>{way.text}</small>{/if}</span>
							<Icon name="external" />
						</a>
					{:else}
						<p>
							<Icon name={iconOf(way.kind)} />
							<span><strong>{t(`contribute.${way.kind}`)}</strong><small>{way.text}</small></span>
						</p>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	section {
		margin-top: var(--space-xl);
	}
	ul {
		margin: var(--space-s) 0 0;
		padding: 0;
		list-style: none;
	}
	li > :is(a, p) {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		margin: 0;
		padding-block: var(--space-xs);
		color: var(--color-fg);
	}
	li + li {
		border-top: var(--border);
	}
	span {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	small {
		color: var(--color-muted);
	}
</style>
