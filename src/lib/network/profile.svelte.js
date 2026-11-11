import { createContext } from 'svelte';
import { data } from './network.svelte.js';
import { isLive } from '#lib/models/job-post.js';

/**
 * What one account made, as its page shows it (/{handle}): the job offers it posted.
 * @typedef {{handle: string, did: string | undefined, self: boolean}} ProfileContext
 *   did: undefined while the handle is being resolved.
 */

/** Its own page shows expired offers too, to renew or delete them. @param {string} did @param {boolean} self */
export function postsBy(did, self) {
	return data.posts.filter((p) => p.did === did && (self || isLive(p.record.value)));
}

/** The profile being shown, from its layout to its tabs. */
export const [getProfile, setProfile] = /** @type {ReturnType<typeof createContext<ProfileContext>>} */ (createContext());
