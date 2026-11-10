import { refused } from '#lib/atproto/xrpc.js';
import { loadJob } from './load-job.js';
import { data, network } from './network.svelte.js';
import { toPost } from '#lib/models/job-post.js';

/**
 * The offer at /job/{did}/{rkey}: from the network when loaded, otherwise
 * read straight from its poster's server (just posted, or not indexed yet).
 * post: undefined while looking, null when it does not exist; unreachable: its poster's
 * server did not answer (then nothing can be said of it).
 * @param {() => {did: string, rkey: string}} params
 */
export function findPost(params) {
	const known = $derived(data.posts.find((p) => p.did === params().did && p.rkey === params().rkey));
	/** @type {import('#lib/models/job-post.js').JobPost | null | undefined} */
	let fetched = $state(undefined);
	let unreachable = $state(false);

	$effect(() => {
		const { did, rkey } = params();
		if (known || network.loading || data.status === 'reading') return;
		unreachable = false;
		loadJob(did, rkey)
			.then((r) => (fetched = r ? toPost(r, data.profiles) : null))
			.catch((err) => (refused(err) ? (fetched = null) : (unreachable = true)));
	});

	return {
		get post() {
			return known || fetched;
		},
		get unreachable() {
			return !known && unreachable;
		}
	};
}
