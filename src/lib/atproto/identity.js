import config from '#lib/data/config.json' with { type: 'json' };
import { xrpcGet } from './xrpc.js';

/** @type {Map<string, Promise<string>>} */
const pdsCache = new Map();

/**
 * The PDS hosting a DID's repository.
 * @param {string} did
 */
export function getPds(did) {
	if (!pdsCache.has(did)) pdsCache.set(did, resolvePds(did));
	return /** @type {Promise<string>} */ (pdsCache.get(did));
}

/** @param {string} did */
async function resolvePds(did) {
	const url = did.startsWith('did:web:')
		? `https://${did.slice('did:web:'.length)}/.well-known/did.json`
		: `${config.services.plc}/${did}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`cannot resolve ${did}`);
	const doc = await res.json();
	const service = (doc.service || []).find(
		(/** @type {{id: string}} */ s) => s.id === '#atproto_pds' || s.id === `${did}#atproto_pds`
	);
	if (!service) throw new Error(`no PDS for ${did}`);
	return service.serviceEndpoint;
}

/**
 * Resolve a handle (or pass through a DID).
 * @param {string} actor
 */
export async function resolveDid(actor) {
	if (actor.startsWith('did:')) return actor;
	const { did } = await xrpcGet(config.services.appview, 'com.atproto.identity.resolveHandle', {
		handle: actor
	});
	return did;
}

/**
 * @typedef {{did: string, handle: string, displayName?: string, avatar?: string, verified?: boolean}} Profile
 *   verified: set by the indexer in the snapshot (indexer/handles.js), never by the AppView.
 */

/** @type {Map<string, Profile>} */
const profileCache = new Map();

/**
 * Verified handles and display info, from the public AppView.
 * Unknown or invalid handles come back as 'handle.invalid'.
 * @param {string[]} dids
 * @returns {Promise<Map<string, Profile>>}
 */
export async function getProfiles(dids) {
	const missing = [...new Set(dids)].filter((did) => !profileCache.has(did));
	for (let i = 0; i < missing.length; i += 25) {
		const batch = missing.slice(i, i + 25);
		const url = new URL(`${config.services.appview}/xrpc/app.bsky.actor.getProfiles`);
		for (const did of batch) url.searchParams.append('actors', did);
		try {
			const res = await fetch(url, { headers: { accept: 'application/json' } });
			const data = res.ok ? await res.json() : { profiles: [] };
			for (const p of data.profiles || []) {
				profileCache.set(p.did, {
					did: p.did,
					handle: p.handle,
					displayName: p.displayName,
					avatar: p.avatar
				});
			}
		} catch {
			// profiles are display sugar; the records still load
		}
		for (const did of batch) {
			if (!profileCache.has(did)) profileCache.set(did, { did, handle: did });
		}
	}
	return new Map(dids.map((did) => [did, /** @type {Profile} */ (profileCache.get(did))]));
}
