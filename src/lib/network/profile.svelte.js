import { createContext } from 'svelte';
import { data, handleOf } from './network.svelte.js';
import { listJobStats } from './job-counts.svelte.js';
import { findLists } from '#lib/models/list-filters.js';
import { isLive } from '#lib/models/job-post.js';

/**
 * What one account made, as its profile pages show it (/{handle}, /{handle}/jobs,
 * /{handle}/companies): its lists, the most useful first (as on the lists page),
 * the job offers it posted, and the organizations it described.
 * @typedef {{handle: string, did: string | undefined, self: boolean}} ProfileContext
 *   did: undefined while the handle is being resolved.
 */

/** @param {string} did */
export function listsBy(did) {
	const lists = data.lists.filter((l) => l.did === did);
	const stats = new Map(lists.map((l) => [l.uri, listJobStats(l)]));
	return findLists(lists, { query: '', hiring: false, open: false }, stats, { handleOf });
}

/** Its own page shows expired offers too, to renew or delete them. @param {string} did @param {boolean} self */
export function postsBy(did, self) {
	return data.posts.filter((p) => p.did === did && (self || isLive(p.record.value)));
}

/** @param {string} did */
export function companiesBy(did) {
	return [...data.companies.values()].filter((c) => c.versions.some((v) => v.did === did));
}

/** The profile being shown, from its layout to its tabs. */
export const [getProfile, setProfile] = /** @type {ReturnType<typeof createContext<ProfileContext>>} */ (createContext());
