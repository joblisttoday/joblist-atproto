/**
 * Handles checked both ways, as atproto defines it, without trusting an AppView:
 * the domain names the account (DNS TXT `_atproto.<domain>` "did=…", read over
 * DNS-over-HTTPS, else https://<domain>/.well-known/atproto-did), and the
 * account's DID document names the domain (`alsoKnownAs: at://<domain>`).
 * Only accounts whose handle would make them speak for a company are checked:
 * those whose handle is a company they describe or post jobs for.
 *
 * The result is published in the snapshot's profiles (`verified`): true when
 * both ways agree, false when they do not, left out when it could not be
 * checked (the app then believes the AppView, as before).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { mapLimit } from '../src/lib/atproto/xrpc.js';

/** @typedef {typeof fetch} Fetch */

/** @param {Fetch} fetcher @param {string} url @param {RequestInit} [init] */
const get = (fetcher, url, init = {}) => fetcher(url, { ...init, signal: AbortSignal.timeout(config.handles.timeoutMs) });

/**
 * The DIDs a domain's DNS names: [] when it names none, null when DNS could not be asked.
 * @param {string} domain
 * @param {Fetch} fetcher
 * @returns {Promise<string[] | null>}
 */
async function dnsDids(domain, fetcher) {
	try {
		const url = `${config.handles.dns}?name=${encodeURIComponent(`_atproto.${domain}`)}&type=TXT`;
		const res = await get(fetcher, url, { headers: { accept: 'application/dns-json' } });
		if (!res.ok) return null;
		const answer = await res.json();
		// 0: found, 3: no such name. Anything else: DNS did not answer.
		if (answer.Status === 3) return [];
		if (answer.Status !== 0) return null;
		return (answer.Answer || [])
			.filter((/** @type {{type: number}} */ a) => a.type === 16)
			.map((/** @type {{data: string}} */ a) => String(a.data).replace(/^"|"$/g, '').replace(/"\s*"/g, ''))
			.filter((/** @type {string} */ text) => text.startsWith('did='))
			.map((/** @type {string} */ text) => text.slice(4).trim());
	} catch {
		return null;
	}
}

/**
 * The DID the domain's website names: '' when it names none, null when it could not be asked.
 * @param {string} domain
 * @param {Fetch} fetcher
 * @returns {Promise<string | null>}
 */
async function wellKnownDid(domain, fetcher) {
	try {
		const res = await get(fetcher, `https://${domain}/.well-known/atproto-did`, { redirect: 'error' });
		if (res.status >= 500) return null;
		if (!res.ok) return '';
		const did = (await res.text()).trim();
		return /^did:[a-z]+:[A-Za-z0-9._:%-]+$/.test(did) ? did : '';
	} catch (err) {
		return err instanceof Error && err.name === 'TimeoutError' ? null : '';
	}
}

/**
 * The DID a domain resolves to: '' when none (or DNS names several), null when unknown.
 * @param {string} domain
 * @param {Fetch} [fetcher]
 * @returns {Promise<string | null>}
 */
export async function resolveHandle(domain, fetcher = fetch) {
	const fromDns = await dnsDids(domain, fetcher);
	if (fromDns && new Set(fromDns).size > 1) return '';
	if (fromDns?.length) return fromDns[0];
	const fromWeb = await wellKnownDid(domain, fetcher);
	// DNS could not be asked and the website names nothing: not known either way.
	return fromWeb === '' && fromDns === null ? null : fromWeb;
}

/**
 * The handles a DID document claims (alsoKnownAs at://…), lowercase; null when unknown.
 * @param {string} did
 * @param {Fetch} fetcher
 * @returns {Promise<string[] | null>}
 */
async function claimedHandles(did, fetcher) {
	const url = did.startsWith('did:web:') ? `https://${did.slice('did:web:'.length)}/.well-known/did.json` : did.startsWith('did:plc:') ? `${config.services.plc}/${did}` : '';
	if (!url) return [];
	try {
		const res = await get(fetcher, url);
		if (res.status === 404 || res.status === 410) return [];
		if (!res.ok) return null;
		const doc = await res.json();
		if (doc.id !== did) return [];
		return (Array.isArray(doc.alsoKnownAs) ? doc.alsoKnownAs : [])
			.filter((/** @type {unknown} */ a) => typeof a === 'string' && a.startsWith('at://'))
			.map((/** @type {string} */ a) => a.slice('at://'.length).toLowerCase());
	} catch {
		return null;
	}
}

/**
 * Whether a DID's handle is the domain, both ways; undefined when it could not be checked.
 * @param {string} did
 * @param {string} handle
 * @param {Fetch} [fetcher]
 * @returns {Promise<boolean | undefined>}
 */
export async function verifyHandle(did, handle, fetcher = fetch) {
	const [resolved, claimed] = await Promise.all([resolveHandle(handle, fetcher), claimedHandles(did, fetcher)]);
	if (resolved === null || claimed === null) return undefined;
	return resolved === did && claimed.includes(handle.toLowerCase());
}

/**
 * Profiles with `verified` set for the accounts whose handle would make them speak
 * for a company: a company they wrote a version of, or posted a job for.
 * @param {Map<string, {did: string, handle: string, verified?: boolean}>} profiles
 * @param {{did: string, rkey: string, value: Record<string, any>}[]} companyRecords
 * @param {{did: string, value: Record<string, any>}[]} jobRecords
 * @param {Fetch} [fetcher]
 * @returns {Promise<{checked: number, failed: string[], unknown: number}>} changes `profiles` in place
 */
export async function verifyCompanyHandles(profiles, companyRecords, jobRecords, fetcher = fetch) {
	const claims = new Set([
		...companyRecords.filter((r) => profiles.get(r.did)?.handle === r.rkey).map((r) => r.did),
		...jobRecords.filter((r) => profiles.get(r.did)?.handle === r.value.company).map((r) => r.did)
	]);
	/** @type {string[]} */
	const failed = [];
	let unknown = 0;
	await mapLimit([...claims], config.handles.concurrency, async (did) => {
		const profile = /** @type {{did: string, handle: string, verified?: boolean}} */ (profiles.get(did));
		const verified = await verifyHandle(did, profile.handle, fetcher);
		if (verified === undefined) unknown++;
		else profiles.set(did, { ...profile, verified });
		if (verified === false) failed.push(profile.handle);
	});
	return { checked: claims.size, failed, unknown };
}
