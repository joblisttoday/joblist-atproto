import { loadJob } from './load-job.js';
import { data, network } from './network.svelte.js';
import { toPost } from '#lib/models/job-post.js';

/**
 * The offer at /job/{did}/{rkey}: from the network when loaded, otherwise
 * read straight from its poster's server (just posted, or not indexed yet).
 * undefined while looking, null when it does not exist.
 * @param {() => {did: string, rkey: string}} params
 */
export function findPost(params) {
	const known = $derived(data.posts.find((p) => p.did === params().did && p.rkey === params().rkey));
	/** @type {import('#lib/models/job-post.js').JobPost | null | undefined} */
	let fetched = $state(undefined);

	$effect(() => {
		const { did, rkey } = params();
		if (known || network.loading) return;
		loadJob(did, rkey)
			.then((r) => (fetched = r ? toPost(r, data.profiles) : null))
			.catch(() => (fetched = null));
	});

	return {
		get post() {
			return known || fetched;
		}
	};
}
