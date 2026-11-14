import config from '#lib/data/config.json' with { type: 'json' };
import blocklist from '#lib/data/blocklist.json' with { type: 'json' };
import { getProfile, getRecord, handleOf, listRecords, resolveDid } from '#lib/atproto.js';
import { isLive, toCompany, toJob } from '#lib/records.js';

/**
 * An organization's profile, read from its own account when its page opens: its account
 * (its handle is its domain, confirmed both ways), its description (the company record
 * keyed by that domain) and its job offers (those it posted for that domain). Only its own
 * account speaks for a domain: records anyone else writes about it are not read. Blocked
 * accounts and links (data/blocklist.json) are left out.
 * @typedef {ReturnType<typeof toJob> & {rkey: string, live: boolean, value: Record<string, any>}} Job
 * @typedef {{domain: string, did: string, avatar: string, company: ReturnType<typeof toCompany> | null, value: Record<string, any> | null, jobs: Job[]}} Profile
 */

const blocked = new Set(/** @type {string[]} */ (blocklist.accounts));

/** A domain as a page address takes it: lowercase, no scheme, no path. @param {string} text */
export function domainOf(text) {
	const value = text.trim().toLowerCase().replace(/^@/, '').replace(/^https?:\/\//, '').replace(/[/?#].*$/, '').replace(/\.$/, '');
	return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(value) ? value : '';
}

/**
 * Its profile; null when the domain is no account, or no account speaks for it.
 * It throws when a server does not answer.
 * @param {string} domain
 * @returns {Promise<Profile | null>}
 */
export async function loadProfile(domain) {
	const did = await resolveDid(domain).catch(() => null);
	if (!did || blocked.has(did) || (await handleOf(did)) !== domain) return null;
	const [record, records, bluesky] = await Promise.all([
		getRecord(did, config.collections.company, domain),
		listRecords(did, config.collections.job),
		getProfile(did)
	]);
	const jobs = records
		.filter((r) => r.value?.company === domain && r.value?.title)
		.map((r) => ({ ...toJob(r.value), rkey: r.rkey, live: isLive(r.value), value: r.value }))
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	return { domain, did, avatar: bluesky?.avatar || '', company: record?.value?.name ? toCompany(record.value) : null, value: record?.value || null, jobs };
}

/**
 * One job offer, with its organization's domain and name: null when it is not there, or not
 * its organization's own.
 * @param {string} did
 * @param {string} rkey
 */
export async function loadJob(did, rkey) {
	if (blocked.has(did)) return null;
	const [record, handle] = await Promise.all([getRecord(did, config.collections.job, rkey), handleOf(did)]);
	if (!record?.value?.title || !handle || record.value.company !== handle) return null;
	const company = await getRecord(did, config.collections.company, handle).catch(() => null);
	return { ...toJob(record.value), rkey, did, name: String(company?.value?.name || handle), live: isLive(record.value), value: record.value };
}
