<script>
	import JobPostMenu from './JobPostMenu.svelte';
	import { data, handleOf, listsWith } from '#lib/network/network.svelte.js';
	import { postPath } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The signed-in person's job posts, expired ones too, to edit, renew or delete,
	 * each with the lists that show it (those with its company).
	 * @type {{posts: import('#lib/models/job-post.js').JobPost[], company?: boolean}}
	 */
	let { posts, company = true } = $props();
</script>

<jl-my-job-posts>
	<ul>
		{#each posts as post (post.uri)}
			{@const lists = listsWith(post.company)}
			<li>
				<a href={postPath(post.did, post.rkey)}>{post.title}</a>
				{#if company}<small>{data.companies.get(post.company)?.name || post.company}</small>{/if}
				<small>
					{#if lists.length}
						{t('post.lists.in')}
						{#each lists as list, i (list.uri)}{i ? ', ' : ' '}<a href="/{handleOf(list.did)}/{list.rkey}">{list.name}</a>{/each}
					{:else}
						{t('post.lists.none')}
					{/if}
					· <a href="{postPath(post.did, post.rkey)}/lists">{t('post.lists.title')}</a>
				</small>
				<JobPostMenu {post} />
			</li>
		{:else}
			<li><small>{t('post.mine.empty')}</small></li>
		{/each}
	</ul>
</jl-my-job-posts>

<style>
	li {
		padding: var(--space-s) 0 0;
		border-bottom: var(--border);
	}
	li > a {
		font-weight: var(--font-weight-strong);
	}
	li > small {
		display: block;
	}
</style>
