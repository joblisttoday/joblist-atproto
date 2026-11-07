<script>
	import AddToList from './AddToList.svelte';
	import ListItem from './ListItem.svelte';
	import SuggestToList from './SuggestToList.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, listsWith, membersOf } from '#lib/network/network.svelte.js';
	import { jobTerms, relatedLists } from '#lib/models/list-match.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where a posted job shows: the lists with its company, the poster's own lists
	 * (one tap adds the company), and others' lists about its city or field.
	 * @type {{post: import('#lib/models/job-post.js').JobPost}}
	 */
	let { post } = $props();
	const company = $derived(data.companies.get(post.company));
	const name = $derived(company?.name || post.company);
	const shownIn = $derived(listsWith(post.company).filter((l) => l.did !== session.did));
	const related = $derived(
		relatedLists(
			data.lists.filter((l) => l.did !== session.did),
			{
				company: post.company,
				terms: jobTerms(post.locations, company),
				membersOf: (list) => membersOf(list).members.map((m) => m.key),
				companyOf: (key) => data.companies.get(key)
			}
		)
	);
</script>

<jl-post-in-lists>
	<p>{t('post.lists.intro', { company: name })}</p>

	<section aria-labelledby="post-lists-yours">
		<h2 id="post-lists-yours">{t('post.lists.yours')}</h2>
		<AddToList key={post.company} />
	</section>

	<section aria-labelledby="post-lists-related">
		<h2 id="post-lists-related">{t('post.lists.related')}</h2>
		{#if related.length}
			<p><small>{t('post.lists.related.help')}</small></p>
			<ul>
				{#each related as list (list.uri)}
					<li><ListItem {list} /><SuggestToList {list} company={post.company} /></li>
				{/each}
			</ul>
		{:else}
			<p><small>{t('post.lists.related.none')}</small></p>
		{/if}
	</section>

	{#if shownIn.length}
		<section aria-labelledby="post-lists-in">
			<h2 id="post-lists-in">{t('post.lists.in')}</h2>
			<ul>{#each shownIn as list (list.uri)}<li><ListItem {list} /></li>{/each}</ul>
		</section>
	{/if}
</jl-post-in-lists>

<style>
	jl-post-in-lists {
		display: block;
	}
	section {
		margin-top: var(--space-l);
	}
	h2 {
		font-size: var(--font-size);
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
	li > :global(jl-list) {
		flex: 1;
		border-bottom: 0;
	}
</style>
