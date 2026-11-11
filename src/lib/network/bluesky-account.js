import config from '#lib/data/config.json' with { type: 'json' };

/**
 * @typedef {{did: string, handle: string, name: string, avatar: string, description: string, followers: number}} BlueskyFound
 */

/**
 * The Bluesky account whose handle is this (a domain), as the AppView verified it, or null.
 * @param {string} handle
 * @returns {Promise<BlueskyFound | null>}
 */
export async function bluesky(handle) {
	if (!handle || !handle.includes('.')) return null;
	try {
		const base = config.services.appview;
		const resolved = await fetch(`${base}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`);
		if (!resolved.ok) return null;
		const { did } = await resolved.json();
		const res = await fetch(`${base}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`);
		if (!res.ok) return null;
		const p = await res.json();
		// The handle the AppView verified (the domain names the account, and back).
		if (p.handle !== handle.toLowerCase()) return null;
		return {
			did,
			handle: p.handle,
			name: String(p.displayName || '').trim(),
			avatar: String(p.avatar || ''),
			description: String(p.description || '').trim(),
			followers: Number(p.followersCount) || 0
		};
	} catch {
		return null;
	}
}
