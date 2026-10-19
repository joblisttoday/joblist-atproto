<script>
	import revenue from '#lib/data/revenue.json';
	import { featurePath } from '#lib/models/featured.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * "Feature this job": to its payment page. Hidden while featuring is not open.
	 * @type {{job: import('#lib/models/featured.js').FeatureJob, title?: string}}
	 */
	let { job, title = '' } = $props();
</script>

{#if revenue.featured.paymentLink}
	<a href={featurePath(job, title)}>{t('featured.action')}</a>
{/if}
