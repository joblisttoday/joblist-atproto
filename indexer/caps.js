/**
 * What one account can make the indexer do or publish is bounded: every record is
 * kept within its lexicon's limits, each account within a number of records per
 * type, and job boards are read for a bounded number of companies per account and
 * in all. Accounts in config.bots (the crawler, the import) are not counted per
 * account: they hold the starting list.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { capRecord } from '../src/lib/models/limits.js';
import { isLive } from '../src/lib/models/job-post.js';
import { hasJobsApi } from '../src/lib/models/company.js';

/**
 * @typedef {import('../src/lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {import('../src/lib/models/company.js').Company} Company
 * @typedef {Record<string, RepoRecord[]>} RecordsByType by type (company, list, job, suggestion)
 */

/**
 * Records within their lexicon's limits, and at most `limits[type]` per account and type.
 * Jobs keep the live ones first, newest first; other types keep their first records (by key).
 * @param {RecordsByType} records
 * @param {Record<string, number>} [limits]
 * @param {string[]} [exempt]
 * @param {number} [now]
 * @returns {{records: RecordsByType, dropped: {did: string, type: string, count: number}[]}}
 */
export function limitAccounts(records, limits = config.limits.perAccount, exempt = config.bots, now = Date.now()) {
	/** @type {RecordsByType} */
	const kept = {};
	/** @type {{did: string, type: string, count: number}[]} */
	const dropped = [];
	for (const [type, list] of Object.entries(records)) {
		const nsid = /** @type {Record<string, string>} */ (config.collections)[type];
		const capped = list.map((r) => ({ ...r, value: capRecord(nsid, r.value) }));
		/** @type {Map<string, RepoRecord[]>} */
		const byDid = new Map();
		for (const r of capped) byDid.set(r.did, [...(byDid.get(r.did) || []), r]);
		kept[type] = [];
		for (const [did, own] of byDid) {
			const max = limits[type];
			if (!max || exempt.includes(did) || own.length <= max) {
				kept[type].push(...own);
				continue;
			}
			const ordered = type === 'job' ? [...own].sort((a, b) => rankJob(b, now) - rankJob(a, now) || String(b.value.createdAt).localeCompare(String(a.value.createdAt))) : own;
			kept[type].push(...ordered.slice(0, max));
			dropped.push({ did, type, count: own.length - max });
		}
	}
	return { records: kept, dropped };
}

/** @param {RepoRecord} r @param {number} now */
const rankJob = (r, now) => (isLive(r.value, now) ? 1 : 0);

/**
 * The companies whose job board is read this run: at most `perAccount` per author of
 * the version shown (bots exempt), at most `total` in all, companies' own versions first,
 * then the bots', then the others'.
 * @param {Company[]} companies
 * @param {{perAccount?: number, total?: number, exempt?: string[]}} [options]
 * @returns {{kept: Company[], dropped: {did: string, count: number}[], overTotal: number}}
 */
export function limitBoards(companies, { perAccount = config.limits.boardsPerAccount, total = config.limits.boards, exempt = config.bots } = {}) {
	/** @type {Map<string, number>} */
	const counts = new Map();
	/** @type {Map<string, number>} */
	const over = new Map();
	const rank = (/** @type {Company} */ c) => (c.verified ? 0 : exempt.includes(c.record.did) ? 1 : 2);
	const withBoard = companies.filter(hasJobsApi).sort((a, b) => rank(a) - rank(b));
	/** @type {Company[]} */
	const kept = [];
	for (const company of withBoard) {
		const did = company.record.did;
		const count = (counts.get(did) || 0) + 1;
		counts.set(did, count);
		if (!company.verified && !exempt.includes(did) && count > perAccount) over.set(did, (over.get(did) || 0) + 1);
		else kept.push(company);
	}
	return {
		kept: kept.slice(0, total),
		dropped: [...over].map(([did, count]) => ({ did, count })),
		overTotal: Math.max(0, kept.length - total)
	};
}
