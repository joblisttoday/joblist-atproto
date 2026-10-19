<script>
	import revenue from '#lib/data/revenue.json';
	import { featuredId } from '#lib/models/featured.js';
	import { featured, loadFeatured } from '#lib/network/featured.svelte.js';
	import { checkout } from '#lib/network/checkout.js';
	import { longDate } from '#lib/i18n/dates.js';
	import { money } from '#lib/i18n/money.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The job about to be featured, and the button to pay for it.
	 * @type {{job: import('#lib/models/featured.js').FeatureJob, title: string, company: string, href: string}}
	 *   href: the job's page (here, or on its job board)
	 */
	let { job, title, company, href } = $props();
	const { price, days } = revenue.featured;
	const amount = $derived(money(price, revenue.currency, i18n.locale));
	/** @type {string} */
	let id = $state('');
	const current = $derived(featured.items.find((item) => item.id === id));
	let busy = $state(false);
	let failed = $state(false);

	loadFeatured();
	$effect(() => {
		featuredId(job).then((value) => (id = value));
	});

	async function pay() {
		busy = true;
		failed = false;
		try {
			await checkout(job, href);
		} catch {
			failed = true;
			busy = false;
		}
	}
</script>

<jl-feature-checkout featured={current ? true : undefined}>
	<section aria-labelledby="feature-job">
		<h2 id="feature-job">{t('featured.job')}</h2>
		<p>
			<a {href} target={job.kind === 'board' ? '_blank' : undefined} rel={job.kind === 'board' ? 'noopener' : undefined}>{title || href}</a>
			<small>{company}</small>
		</p>
		{#if current}<p><small>{t('featured.until', { date: longDate(current.until, i18n.locale), days })}</small></p>{/if}
		{#if revenue.featured.paymentLink}
			<button type="submit" disabled={busy} onclick={pay}>{busy ? t('featured.paying') : t('featured.pay', { price: amount, days })}</button>
			<p><small>{t('featured.privacy')}</small></p>
			{#if failed}<p role="alert">{t('featured.error')}</p>{/if}
		{:else}
			<p>{t('featured.unavailable')}</p>
		{/if}
	</section>
</jl-feature-checkout>

<style>
	jl-feature-checkout {
		display: block;
		margin: var(--space-l) 0;
		padding: 0 var(--space-m) var(--space-s);
		border: var(--border);
		border-radius: var(--radius);
	}
	p > a {
		display: block;
		font-weight: var(--font-weight-strong);
	}
	small {
		display: block;
	}
	button {
		width: 100%;
		margin-bottom: var(--space-s);
	}
</style>
