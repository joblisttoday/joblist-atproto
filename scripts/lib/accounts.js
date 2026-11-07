/**
 * Bluesky accounts that may be companies: their handle is a registered domain
 * (acme.com, not acme.bsky.social), found from public, read-only listings:
 * profiles matching a few words (careers, jobs…), and the followers of a few
 * accounts (joblist's own). Each handle is then checked both ways (the domain
 * names the account, the account names the domain), so the account speaks
 * for the domain. Only public data is read: nobody is contacted.
 */
import { mapLimit, xrpcGet } from '../../src/lib/atproto/xrpc.js';
import { verifyHandle } from '../../indexer/handles.js';
import { isDomainHandle } from './hiring.js';

/**
 * @typedef {{did: string, handle: string, source: string}} DomainAccount
 * @typedef {{queries: string[], pages: number, followersOf: string[], followerPages: number, maxAccounts: number, concurrency: number}} AccountsConfig
 */

/**
 * A handle that can be a company's domain: a registered domain, not on a host giving handles away.
 * @param {string} handle
 * @param {string[]} hosted suffixes of hosted handles (config.hostedHandles)
 */
export function isCompanyHandle(handle, hosted) {
	const h = (handle || '').toLowerCase();
	return isDomainHandle(h) && !hosted.some((suffix) => h.endsWith(suffix));
}

/**
 * Domain accounts from several sources, in order, each handle once, without
 * the domains already known, at most `max` of them.
 * @param {DomainAccount[][]} sources
 * @param {{known: (domain: string) => boolean, hosted: string[], max: number}} options
 * @returns {{accounts: DomainAccount[], dropped: number}}
 */
export function pickAccounts(sources, { known, hosted, max }) {
	/** @type {Map<string, DomainAccount>} */
	const picked = new Map();
	let dropped = 0;
	for (const account of sources.flat()) {
		const handle = (account.handle || '').toLowerCase();
		if (!account.did || !isCompanyHandle(handle, hosted) || known(handle) || picked.has(handle)) continue;
		if (picked.size >= max) {
			dropped++;
			continue;
		}
		picked.set(handle, { did: account.did, handle, source: account.source });
	}
	return { accounts: [...picked.values()], dropped };
}

/**
 * Pages of a public listing, until it ends or `pages` were read.
 * @param {string} service
 * @param {string} method
 * @param {Record<string, string | number>} params
 * @param {string} field the list in each page
 * @param {number} pages
 * @returns {Promise<{did: string, handle: string}[]>}
 */
async function readPages(service, method, params, field, pages) {
	/** @type {{did: string, handle: string}[]} */
	const items = [];
	/** @type {string | undefined} */
	let cursor;
	for (let page = 0; page < pages; page++) {
		const result = await xrpcGet(service, method, { ...params, limit: 100, cursor });
		items.push(...(result[field] || []));
		cursor = result.cursor;
		if (!cursor) break;
	}
	return items;
}

/**
 * Accounts whose profile matches one of the queries (app.bsky.actor.searchActors).
 * @param {string} service a public AppView
 * @param {AccountsConfig} settings
 * @returns {Promise<DomainAccount[]>}
 */
export async function searchAccounts(service, settings) {
	/** @type {DomainAccount[]} */
	const found = [];
	for (const q of settings.queries) {
		const actors = await readPages(service, 'app.bsky.actor.searchActors', { q }, 'actors', settings.pages);
		found.push(...actors.map((a) => ({ did: a.did, handle: a.handle, source: `profile search "${q}"` })));
	}
	return found;
}

/**
 * Followers of the given accounts (app.bsky.graph.getFollowers).
 * @param {string} service a public AppView
 * @param {AccountsConfig} settings
 * @returns {Promise<DomainAccount[]>}
 */
export async function followerAccounts(service, settings) {
	/** @type {DomainAccount[]} */
	const found = [];
	for (const actor of settings.followersOf) {
		const followers = await readPages(service, 'app.bsky.graph.getFollowers', { actor }, 'followers', settings.followerPages);
		found.push(...followers.map((a) => ({ did: a.did, handle: a.handle, source: `follower of @${actor}` })));
	}
	return found;
}

/**
 * The accounts whose handle is checked both ways; the others with why.
 * @param {DomainAccount[]} accounts
 * @param {number} concurrency
 * @param {typeof fetch} [fetcher]
 */
export async function verifyAccounts(accounts, concurrency, fetcher) {
	const results = await mapLimit(accounts, concurrency, async (a) => ({ account: a, verified: await verifyHandle(a.did, a.handle, fetcher) }));
	return {
		verified: results.filter((r) => r.verified === true).map((r) => r.account),
		rejected: results.filter((r) => r.verified !== true).map((r) => ({ key: r.account.handle, source: r.account.source, reason: r.verified === false ? 'handle not verified both ways' : 'handle could not be checked' }))
	};
}
