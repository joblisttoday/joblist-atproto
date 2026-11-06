/**
 * Companies on Bluesky: those whose domain is a Bluesky handle, checked both ways
 * (the domain names the account, and the account's handle is the domain, as the
 * AppView verifies). Such an account is the company's own; its picture and
 * profile are shown on its page, and it can sign in to manage it.
 *
 * @typedef {{did: string, name?: string, avatar?: string, followers: number}} BlueskyAccount
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { mapLimit } from '../src/lib/atproto/xrpc.js';

/**
 * @param {string[]} keys company domains
 * @param {Record<string, BlueskyAccount>} previous the last run's, kept for a domain that could not be checked
 * @returns {Promise<Record<string, BlueskyAccount>>}
 */
export async function blueskyAccounts(keys, previous) {
	/** @type {Map<string, string>} */
	const dids = new Map();
	/** @type {Set<string>} */
	const unchecked = new Set();
	await mapLimit(keys, config.bluesky.concurrency, async (key) => {
		try {
			const res = await fetch(`${config.services.handleResolver}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(key)}`);
			if (res.ok) dids.set(key, (await res.json()).did);
			// 400: no account has this handle. Anything else: ask again next run.
			else if (res.status !== 400) unchecked.add(key);
		} catch {
			unchecked.add(key);
		}
	});
	/** @type {Record<string, BlueskyAccount>} */
	const accounts = {};
	const found = [...dids];
	for (let i = 0; i < found.length; i += 25) {
		const url = new URL(`${config.services.appview}/xrpc/app.bsky.actor.getProfiles`);
		for (const [, did] of found.slice(i, i + 25)) url.searchParams.append('actors', did);
		const res = await fetch(url).catch(() => null);
		if (!res?.ok) {
			for (const [key] of found.slice(i, i + 25)) unchecked.add(key);
			continue;
		}
		const { profiles = [] } = await res.json();
		for (const p of profiles) {
			const key = found.find(([, did]) => did === p.did)?.[0];
			// The account must say it is the domain too: its handle, as verified by the AppView.
			if (!key || p.handle !== key) continue;
			accounts[key] = { did: p.did, name: p.displayName || undefined, avatar: p.avatar || undefined, followers: p.followersCount || 0 };
		}
	}
	for (const key of unchecked) if (previous[key]) accounts[key] = previous[key];
	return accounts;
}
