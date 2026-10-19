<script>
	import config from '#lib/data/config.json';
	import revenue from '#lib/data/revenue.json';
	import { lastCheckout } from '#lib/network/checkout.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Where Stripe sends people back after paying: no session, nothing to check.
	const job = lastCheckout();
	const own = job.startsWith('/');
</script>

<svelte:head><title>{t('featured.thanks.title')} · {config.name}</title></svelte:head>

<jl-featured-thanks>
	<h1>{t('featured.thanks.title')}</h1>
	<p>{t('featured.thanks.text', { days: revenue.featured.days })}</p>
	<p><small>{t('featured.thanks.receipt')}</small></p>
	<menu>
		{#if job}<a href={job} target={own ? undefined : '_blank'} rel={own ? undefined : 'noopener'}>{t('featured.thanks.job')}</a>{/if}
		<a href="/jobs">{t('nav.jobs')}</a>
	</menu>
</jl-featured-thanks>

<style>
	jl-featured-thanks {
		display: block;
	}
</style>
