<script>
	import JobPostCard from './JobPostCard.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The signed-in organization's job offers, expired ones too, as rows: the ones still
	 * shown first, the latest first.
	 * @type {{posts: import('#lib/models/job-post.js').JobPost[]}}
	 */
	let { posts } = $props();
	const shown = $derived([...posts].sort((a, b) => b.expiresAt.localeCompare(a.expiresAt)));
</script>

<jl-my-job-posts>
	<ul>
		{#each shown as post (post.uri)}
			<li><JobPostCard {post} /></li>
		{:else}
			<li><small>{t('post.mine.empty')}</small></li>
		{/each}
	</ul>
</jl-my-job-posts>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
