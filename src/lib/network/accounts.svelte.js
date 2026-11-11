import { data } from './network.svelte.js';

/**
 * An organization's own Bluesky account (its handle is its domain), when this browser has
 * read it: the organizations looked up (network.svelte.js lookup), the signed-in person.
 * @param {string} key its domain
 * @returns {{handle: string, avatar?: string, followers?: number} | undefined}
 */
export function accountOf(key) {
	for (const profile of data.profiles.values()) if (profile.handle === key) return { handle: profile.handle, avatar: profile.avatar, followers: profile.followers };
	return undefined;
}

/**
 * A smaller copy of a Bluesky picture, for lists.
 * @param {string} url
 */
export function thumbnail(url) {
	return url.replace('/img/avatar/plain/', '/img/avatar_thumbnail/plain/');
}
