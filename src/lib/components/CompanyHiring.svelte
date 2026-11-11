<script>
	import CompanyInvite from './CompanyInvite.svelte';
	import Icon from './Icon.svelte';
	import MyJobPosts from './MyJobPosts.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { ATPROTO } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * "Post a job" on a company page, for the company's own account (anyone else has it
	 * in the page's menu, ⋯);
	 * the signed-in person's posts for this company, to manage them; where it
	 * posts jobs: on atproto from its own account (said so, or it posted some), else
	 * an invitation to say where, when nobody has yet.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
	const own = $derived(session.handle === company.key);
	const mine = $derived(data.posts.filter((p) => p.did === session.did && p.company === company.key));
	const href = $derived(`/jobs/new?company=${encodeURIComponent(company.key)}`);
	const atproto = $derived(company.jobBoard?.provider === ATPROTO || data.posts.some((p) => p.company === company.key && p.verified));
</script>

<jl-company-hiring own={own || undefined}>
	{#if own}<menu><a {href} data-add="main"><Icon name="add" /> {t('company.post.own')}</a></menu>{/if}
	{#if atproto}
		<p><small>{t('company.atproto', { handle: company.key })}</small></p>
	{:else}
		<CompanyInvite {company} field="jobBoard" />
	{/if}
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
	summary small {
		font-weight: normal;
	}
</style>
