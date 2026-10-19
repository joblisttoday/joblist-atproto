/**
 * Accounts that post about hiring and whose handle is their own domain
 * (acme.com, not acme.bsky.social): the handle proves who they are.
 * Uses the crawler's session when signed in (all pages), otherwise the
 * public Bluesky search, which answers the first page of each query only.
 */
import { siteOf } from './match.js';

/**
 * @typedef {{did: string, handle: string, displayName?: string, posts: string[]}} HiringAccount
 * @typedef {{service: string, queries: string[], pages: number}} SearchConfig
 */

/**
 * @param {SearchConfig} search
 * @param {import('@atproto/api').AtpAgent | null} agent signed-in crawler, if any
 * @returns {Promise<{accounts: HiringAccount[], posts: number, via: string}>}
 */
export async function hiringAccounts(search, agent) {
	/** @type {Map<string, HiringAccount>} */
	const accounts = new Map();
	let posts = 0;
	let via = 'public search, first page of each query';
	for (const q of search.queries) {
		/** @type {string | undefined} */
		let cursor;
		for (let page = 0; page < search.pages; page++) {
			const params = { q, limit: 100, sort: 'latest', cursor };
			/** @type {{posts?: any[], cursor?: string}} */
			let result;
			if (agent) {
				via = 'crawler session';
				result = (await agent.app.bsky.feed.searchPosts(params)).data;
			} else {
				// The public AppView answers the first page only (403 on a cursor).
				if (page > 0) break;
				result = await publicSearch(search.service, params);
			}
			for (const post of result.posts || []) {
				posts++;
				const { did, handle, displayName } = post.author;
				if (!isDomainHandle(handle)) continue;
				const account = accounts.get(handle) || { did, handle, displayName, posts: /** @type {string[]} */ ([]) };
				account.posts.push(post.uri);
				accounts.set(handle, account);
			}
			cursor = result.cursor;
			if (!cursor) break;
		}
	}
	return { accounts: [...accounts.values()], posts, via };
}

/**
 * A handle that is a registered domain itself: 'acme.com', 'acme.co.uk'.
 * @param {string} handle
 */
export function isDomainHandle(handle) {
	return Boolean(handle) && handle !== 'handle.invalid' && siteOf(handle) === handle;
}

/**
 * @param {string} service
 * @param {Record<string, any>} params
 */
async function publicSearch(service, params) {
	const url = new URL(`${service}/xrpc/app.bsky.feed.searchPosts`);
	for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
	const res = await fetch(url, { headers: { accept: 'application/json' } });
	if (!res.ok) throw new Error(`searchPosts ${res.status}`);
	return res.json();
}
