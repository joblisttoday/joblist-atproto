import { ownDomain } from './company.js';

/**
 * Lists someone curates on Bluesky (a list, a starter pack, the accounts someone follows),
 * read to follow their organizations here, privately. Anyone can curate: joblist keeps no
 * list of its own. Pure: the requests are network/curated.js's.
 * @typedef {{kind: 'list' | 'pack', handle: string, rkey: string} | {kind: 'follows', handle: string}} Curated
 * @typedef {{did: string, handle: string, name?: string, avatar?: string}} Member
 * @typedef {{did: string, url: string, name: string, avatar?: string, onJoblist: boolean}} Candidate
 */

/**
 * A curated list from its link: bsky.app/profile/{handle}/lists/{rkey},
 * bsky.app/starter-pack/{handle}/{rkey}, bsky.app/profile/{handle}/follows, or its at:// address.
 * @param {string} text
 * @returns {Curated | null}
 */
export function curatedLink(text) {
	const value = text.trim();
	const at = value.match(/^at:\/\/([^/]+)\/app\.bsky\.graph\.(list|starterpack)\/([a-z0-9]+)$/i);
	if (at) return { kind: at[2].toLowerCase() === 'list' ? 'list' : 'pack', handle: at[1], rkey: at[3] };
	let url;
	try {
		url = new URL(value.includes('://') ? value : `https://${value}`);
	} catch {
		return null;
	}
	if (!/^(www\.)?bsky\.app$/.test(url.hostname)) return null;
	const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
	if (parts[0] === 'profile' && parts[2] === 'lists' && parts[3]) return { kind: 'list', handle: parts[1], rkey: parts[3] };
	if (parts[0] === 'starter-pack' && parts[1] && parts[2]) return { kind: 'pack', handle: parts[1], rkey: parts[2] };
	if (parts[0] === 'profile' && parts[1] && parts[2] === 'follows') return { kind: 'follows', handle: parts[1] };
	return null;
}

/**
 * The organizations among a list's members: accounts whose handle is a domain of their own
 * (not a name on a shared host); those that publish their page on joblist first.
 * @param {Member[]} members
 * @param {Set<string>} onJoblist the accounts with a today.joblist.company record
 * @returns {Candidate[]}
 */
export function candidatesOf(members, onJoblist) {
	/** @type {Candidate[]} */
	const out = [];
	for (const m of members) {
		const domain = ownDomain(m.handle);
		if (!domain || domain === 'handle.invalid' || out.some((c) => c.did === m.did)) continue;
		out.push({ did: m.did, url: `https://${domain}`, name: m.name || domain, avatar: m.avatar, onJoblist: onJoblist.has(m.did) });
	}
	return out.sort((a, b) => Number(b.onJoblist) - Number(a.onJoblist));
}
