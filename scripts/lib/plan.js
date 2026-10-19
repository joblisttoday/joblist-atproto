/**
 * Turn proposals into the crawler's writes, applying the rules of versions.js
 * and the per-run caps. Pure, unit tested in plan.test.js.
 */
import { botVersion, decide } from './versions.js';

/**
 * @typedef {import('./versions.js').RepoRecord} RepoRecord
 * @typedef {{key: string, changes: Record<string, any>, confidence?: string, notes?: string[]}} Repair
 * @typedef {{key: string, value: Record<string, any>, confidence?: string, source: string, notes?: string[]}} Discovery
 * @typedef {{action: 'create' | 'update', rkey: string, value: Record<string, any>, kind: 'repair' | 'new', notes: string[]}} Write
 */

/**
 * @param {{
 *   repairs: Repair[],
 *   discoveries: Discovery[],
 *   versionsByKey: Map<string, RepoRecord[]>,
 *   profiles: import('./versions.js').Profiles,
 *   ctx: import('./versions.js').Context,
 *   caps: {maxWritesPerRun: number, maxNewCompaniesPerRun: number},
 *   now: string
 * }} input
 */
export function planWrites({ repairs, discoveries, versionsByKey, profiles, ctx, caps, now }) {
	/** @type {Write[]} */
	const writes = [];
	/** @type {{key: string, reason: string}[]} */
	const skipped = [];
	const room = () => writes.length < caps.maxWritesPerRun;

	// New companies first, within their own cap, so repairs cannot crowd them out.
	let added = 0;
	const seen = new Set();
	for (const found of discoveries) {
		if (versionsByKey.has(found.key) || seen.has(found.key)) continue;
		seen.add(found.key);
		if (found.confidence !== 'high') {
			skipped.push({ key: found.key, reason: 'low confidence: for a person to decide' });
			continue;
		}
		if (!room() || added >= caps.maxNewCompaniesPerRun) {
			skipped.push({ key: found.key, reason: 'cap reached for this run' });
			continue;
		}
		added++;
		writes.push({
			action: 'create',
			rkey: found.key,
			value: { $type: 'today.joblist.company', ...found.value, createdAt: now, updatedAt: now },
			kind: 'new',
			notes: [`found by ${found.source}`, ...(found.notes || [])]
		});
	}
	// Repairs that bring a job board back first, then websites.
	const ordered = [...repairs].sort((a, b) => Number(Boolean(b.changes.jobBoard)) - Number(Boolean(a.changes.jobBoard)));
	for (const repair of ordered) {
		if (repair.confidence !== 'high') {
			skipped.push({ key: repair.key, reason: 'low confidence: for a person to decide' });
			continue;
		}
		const versions = versionsByKey.get(repair.key) || [];
		if (!versions.length) continue;
		const decision = decide(versions, profiles, ctx);
		if ('skip' in decision) {
			skipped.push({ key: repair.key, reason: decision.skip });
			continue;
		}
		const value = botVersion(decision.base, repair.changes, decision.mine, now);
		if (!value) continue;
		if (!room()) {
			skipped.push({ key: repair.key, reason: 'cap reached for this run' });
			continue;
		}
		writes.push({ action: decision.mine ? 'update' : 'create', rkey: repair.key, value, kind: 'repair', notes: repair.notes || [] });
	}

	return { writes, skipped };
}
