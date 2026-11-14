<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import { domainOf } from '#lib/profile.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** What joblist does, plainly; opening an organization's page by its domain; for an organization, signing in (signed in: its own). */
	let typed = $state('');
	let invalid = $state(false);

	/** @param {SubmitEvent} event */
	function open(event) {
		event.preventDefault();
		const domain = domainOf(typed);
		invalid = !domain;
		if (domain) goto(`/${domain}`);
	}
</script>

<svelte:head><title>{config.name}</title></svelte:head>

<h1>{config.name}</h1>
<p>{t('home.what')}</p>
<p>{t('home.page')}</p>

<section aria-labelledby="home-open">
	<h2 id="home-open">{t('home.open')}</h2>
	<form onsubmit={open}>
		<label>
			{t('home.open.label')}
			<input bind:value={typed} placeholder="example.org" autocapitalize="none" spellcheck="false" aria-invalid={invalid || undefined} />
		</label>
		{#if invalid}<p role="alert">{t('home.open.invalid')}</p>{/if}
		<menu><button type="submit">{t('home.open.submit')}</button></menu>
	</form>
</section>

<section aria-labelledby="home-org">
	<h2 id="home-org">{t('home.org')}</h2>
	{#if session.handle}
		<p>{t('signin.as', { handle: session.handle })}</p>
		<menu><a href="/{session.handle}" data-primary>{t('company.title')}</a></menu>
	{:else}
		<p>{t('home.org.text')}</p>
		<menu><a href="/signin" data-primary>{t('signin.title')}</a></menu>
	{/if}
</section>
