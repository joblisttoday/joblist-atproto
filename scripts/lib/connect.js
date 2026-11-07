/**
 * Companies already on joblist whose domain is their Bluesky handle, but with
 * no job board: look for the board their own website links to, or a board of
 * Open Jobs carrying their name and linking back to their website, and
 * propose it as a repair. The handle, checked both ways, proves the domain is
 * the company's; the board still has to be linked from it.
 */
import { verifyHandle } from '../../indexer/handles.js';
import { discoverCompany } from './discover.js';
import { siteOf } from './match.js';
import { findOpenJobsBoard } from './openjobs.js';

/** @typedef {Record<string, {did: string}>} BlueskyFile the snapshot's bluesky.json: company key → account */

/**
 * Shown versions of companies on Bluesky with no job board, and no board
 * proposed by the repairs, at most `max`.
 * @param {{rkey: string, value: Record<string, any>}[]} shown
 * @param {BlueskyFile} bluesky
 * @param {Map<string, {changes: Record<string, any>}>} repairsByKey
 * @param {number} max
 */
export function companiesToConnect(shown, bluesky, repairsByKey, max) {
	return shown.filter((r) => bluesky[r.rkey]?.did && !r.value.jobBoard?.provider && !repairsByKey.get(r.rkey)?.changes.jobBoard).slice(0, max);
}

/**
 * A board (and the website, when the company has none) for one company on Bluesky.
 * @param {{rkey: string, value: Record<string, any>}} record
 * @param {any} check its health check
 * @param {string} did its Bluesky account
 * @param {import('./openjobs.js').OpenJobsIndex | null} openJobs
 * @returns {Promise<{changes?: Record<string, any>, notes?: string[], reason?: string}>}
 */
export async function connectBoard(record, check, did, openJobs) {
	const key = record.rkey;
	const v = record.value;
	if ((await verifyHandle(did, key)) !== true) return { reason: 'handle not verified both ways' };
	const ownSite = v.url && check?.website?.state === 'ok' && siteOf(new URL(v.url).hostname) === siteOf(key);
	if (ownSite) {
		// Its website was already searched for board links by the repairs: Open Jobs only.
		if (!openJobs) return { reason: 'no live job board found' };
		const label = siteOf(key).split('.')[0];
		const board = await findOpenJobsBoard(openJobs, [v.name, label].filter(Boolean), siteOf(key));
		if (!board) return { reason: 'no live job board found' };
		return connection({ provider: board.provider, id: board.id }, [`board ${board.provider}:${board.id} (${board.jobs} jobs) from Open Jobs, linking back to ${siteOf(key)}`]);
	}
	if (v.url) return { reason: 'its website is not its Bluesky domain, or does not answer' };
	const { found, reason } = await discoverCompany(key, { name: v.name, source: 'Bluesky', openJobs });
	if (!found) return { reason };
	return connection(found.value.jobBoard, found.notes || [], found.value.url);
}

/**
 * @param {{provider: string, id: string}} jobBoard
 * @param {string[]} notes
 * @param {string} [url] a website for a company that has none
 */
function connection(jobBoard, notes, url) {
	/** @type {Record<string, any>} */
	const changes = { jobBoard };
	if (url) changes.url = url;
	return { changes, notes: [...notes, 'its Bluesky handle is its domain, checked both ways'] };
}

/**
 * Add a connection to the company's repair proposal (or start one), as high confidence.
 * Pure: returns the proposal to keep.
 * @param {Record<string, any> | undefined} proposal
 * @param {{rkey: string, uri?: string, value: Record<string, any>}} record
 * @param {{changes: Record<string, any>, notes: string[]}} found
 */
export function mergeConnection(proposal, record, found) {
	const base = proposal || { key: record.rkey, version: record.uri, rkey: record.rkey, name: record.value.name, changes: {}, notes: [] };
	return {
		...base,
		changes: { ...found.changes, ...base.changes, jobBoard: found.changes.jobBoard },
		notes: [...(base.notes || []), ...found.notes],
		confidence: base.confidence === 'low' ? 'low' : 'high',
		bluesky: true
	};
}

/**
 * The snapshot's companies on Bluesky (indexer/bluesky.js).
 * @param {string} url
 * @returns {Promise<BlueskyFile>}
 */
export async function loadBluesky(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${url}: ${res.status}`);
	return res.json();
}
