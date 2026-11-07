<script>
	import config from '#lib/data/config.json';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import PayTable from '#lib/components/stats/PayTable.svelte';
	import RankedBars from '#lib/components/stats/RankedBars.svelte';
	import WeekColumns from '#lib/components/stats/WeekColumns.svelte';
	import Workplace from '#lib/components/stats/Workplace.svelte';
	import { change, percent, readStats, share } from '#lib/models/stats.js';
	import { getStats } from '#lib/network/stats.js';
	import { longDate } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/** @type {import('#lib/models/stats.js').Stats | null | undefined} undefined: being read */
	let stats = $state.raw();
	getStats().then((data) => (stats = readStats(data)));

	const weeks = $derived(stats ? stats.weeks.slice(-config.stats.shownWeeks) : []);
	const latest = $derived(weeks.at(-1));
	const now = $derived(stats?.now);
	const growth = $derived(now ? change(now.newWeek, now.newWeekBefore) : null);
	/** "+120 new this week · open 44 days", as known. @param {number | undefined} fresh @param {number | null} [days] */
	const note = (fresh, days) =>
		[fresh ? t('stats.newThisWeek', { count: fresh }) : '', days ? t('stats.daysOpen.short', { count: days }) : ''].filter(Boolean).join(' · ');
</script>

<svelte:head>
	<title>{t('stats.title')} · {config.name}</title>
	<meta name="description" content={t('stats.intro')} />
</svelte:head>

<PageHeader title={t('stats.title')} intro={t('stats.intro')} />

{#if stats === undefined}
	<p role="status">{t('stats.loading')}</p>
{:else if !stats || !now}
	<p role="status">{t('stats.missing')}</p>
{:else}
	<jl-stats>
		<section aria-labelledby="stats-now" data-wide>
			<h2 id="stats-now">{t('stats.now')}</h2>
			<dl>
				<div><dt>{t('stats.open')}</dt><dd>{now.open.toLocaleString(i18n.locale)}</dd></div>
				<div>
					<dt>{t('stats.newWeek')}</dt>
					<dd>{now.newWeek.toLocaleString(i18n.locale)}</dd>
					{#if growth !== null}<dd><small>{t(growth >= 0 ? 'stats.up' : 'stats.down', { percent: percent(Math.abs(growth), i18n.locale) })}</small></dd>{/if}
				</div>
				<div><dt>{t('stats.companies')}</dt><dd>{now.companies.toLocaleString(i18n.locale)}</dd></div>
				<div><dt>{t('stats.payShown')}</dt><dd>{percent(share(now.payShown, now.open), i18n.locale)}</dd></div>
				{#if now.daysOpen !== null}<div><dt>{t('stats.daysOpen')}</dt><dd>{t('stats.days', { count: now.daysOpen })}</dd></div>{/if}
			</dl>
		</section>

		<section aria-labelledby="stats-weeks" data-wide>
			<h2 id="stats-weeks">{t('stats.weeks')}</h2>
			<p><small>{t('stats.since', { date: longDate(stats.since, i18n.locale) })}</small></p>
			<WeekColumns {weeks} />
		</section>

		<section aria-labelledby="stats-fields">
			<h2 id="stats-fields">{t('stats.fields')}</h2>
			<RankedBars
				label={t('stats.fields')}
				rows={now.fields.map((f) => ({ key: f.slug, href: `/field/${f.slug}`, label: t(`field.${f.slug}`), value: f.open, note: note(latest?.fields[f.slug], f.daysOpen) }))}
			/>
		</section>

		<section aria-labelledby="stats-cities">
			<h2 id="stats-cities">{t('stats.cities')}</h2>
			<RankedBars label={t('stats.cities')} rows={now.cities.map((c) => ({ key: c.slug, href: `/in/${c.slug}`, label: c.name, value: c.open, note: note(latest?.cities[c.slug]) }))} />
		</section>

		<section aria-labelledby="stats-workplace">
			<h2 id="stats-workplace">{t('stats.workplace')}</h2>
			<Workplace workplace={now.workplace} />
		</section>

		<section aria-labelledby="stats-pay">
			<h2 id="stats-pay">{t('stats.pay')}</h2>
			<p><small>{t('stats.pay.intro', { percent: percent(share(now.payShown, now.open), i18n.locale), min: config.stats.minSample })}</small></p>
			<PayTable fields={now.fields} />
		</section>

		<p data-wide><small>{t('stats.about')} <a href="{config.snapshot.path}/{config.stats.file}">{config.stats.file}</a></small></p>
	</jl-stats>
{/if}

<style>
	jl-stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--section-min)), 1fr));
		column-gap: var(--column-gap);
		row-gap: var(--space-m);
		align-items: start;
	}
	[data-wide] {
		grid-column: 1 / -1;
	}
	h2 {
		font-size: var(--font-size-large);
		margin: var(--space-m) 0 var(--space-s);
	}
	section > p {
		margin: 0 0 var(--space-s);
		color: var(--color-muted);
	}
	dl {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--chart-label)), 1fr));
		gap: var(--space-m);
		margin: 0;
	}
	dt {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	dd {
		margin: 0;
		font-size: var(--font-size-large);
		font-weight: var(--font-weight-strong);
	}
	dd small {
		font-size: var(--font-size-small);
		font-weight: normal;
		color: var(--color-muted);
	}
</style>
