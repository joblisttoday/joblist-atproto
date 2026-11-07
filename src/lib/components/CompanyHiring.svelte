<script>
	import CompanyInvite from './CompanyInvite.svelte';
	import MyJobPosts from './MyJobPosts.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * "Post a job" on a company page, prominent for the company's own account;
	 * the signed-in person's posts for this company, to manage them; where it
	 * posts jobs, when nobody has said yet.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
	const own = $derived(session.handle === company.key);
	const mine = $derived(data.posts.filter((p) => p.did === session.did && p.company === company.key));
	const href = $derived(`/jobs/new?company=${encodeURIComponent(company.key)}`);
</script>

<jl-company-hiring own={own || undefined}>
	<menu><a {href}>{own ? t('company.post.own') : `+ ${t('company.post')}`}</a></menu>
	<CompanyInvite {company} field="jobBoard" />
	{#if mine.length}
		<details>
			<summary>{t('post.mine')} <small>{mine.length}</small></summary>
			<MyJobPosts posts={mine} company={false} />
		</details>
	{/if}
</jl-company-hiring>

<style>
	jl-company-hiring {
		display: block;
	}
	jl-company-hiring[own] menu > a {
		width: 100%;
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
		font-weight: var(--font-weight-strong);
	}
	summary small {
		font-weight: normal;
	}
</style>
