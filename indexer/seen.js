/**
 * When the indexer first saw each company version, and each account: a version's
 * author chooses its updatedAt, so "the most recent edit wins" would let anyone put
 * their version on top by saying so. The snapshot says instead when each version
 * (record uri and cid: an edit is a new cid) first appeared, run after run
 * (published as versions.json), and the app orders versions by that (`seenAt`).
 *
 * A version from an account first seen less than `newAccountDays` before it, that
 * replaces another author's older version, is marked `newAuthor`: the app labels it
 * "not checked yet" until an established account saves a newer one, as it does for bots.
 *
 * The first run (no ledger yet) believes the dates the records give, in the past only.
 *
 * @typedef {import('../src/lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{records: Record<string, string>, accounts: Record<string, string>}} SeenLedger
 *   records: first seen, by "uri cid"; accounts: first seen, by DID.
 */
import { editedAt } from '../src/lib/models/company.js';

const DAY = 864e5;

/** @param {RepoRecord} r */
const versionKey = (r) => `${r.uri} ${r.cid}`;

/**
 * @param {string} a @param {string} b ISO dates
 */
const earlier = (a, b) => (!a ? b : !b ? a : Date.parse(a) <= Date.parse(b) ? a : b);

/**
 * A date as ISO, when it is one and not in the future.
 * @param {unknown} value
 * @param {number} nowMs
 */
function pastDate(value, nowMs) {
	const ms = Date.parse(String(value || ''));
	return Number.isFinite(ms) && ms <= nowMs ? new Date(ms).toISOString() : '';
}

/**
 * Company versions with when they were first seen, and the ledger after this run.
 * @param {RepoRecord[]} companyRecords
 * @param {RepoRecord[]} otherRecords every other record (lists, jobs…): they date accounts too
 * @param {Partial<SeenLedger>} ledger as of the last run (not changed)
 * @param {string} now this run (ISO)
 * @param {number} newAccountDays
 * @returns {{records: (RepoRecord & {seenAt: string, newAuthor?: true})[], ledger: SeenLedger, added: number, newAuthors: number}}
 */
export function seeVersions(companyRecords, otherRecords, ledger, now, newAccountDays) {
	const known = ledger.records || {};
	const accounts = ledger.accounts || {};
	const firstRun = !Object.keys(known).length;
	const nowMs = Date.parse(now);
	/** @type {SeenLedger} */
	const next = { records: {}, accounts: {} };
	for (const r of [...companyRecords, ...otherRecords]) {
		next.accounts[r.did] = accounts[r.did] || earlier(next.accounts[r.did] || '', firstRun ? pastDate(r.value?.createdAt, nowMs) || now : now);
	}
	let added = 0;
	const seen = companyRecords.map((r) => {
		const key = versionKey(r);
		const at = known[key] || (firstRun ? pastDate(editedAt(r, nowMs), nowMs) || now : now);
		if (!known[key]) added++;
		next.records[key] = at;
		return { ...r, seenAt: at };
	});
	/** @type {Map<string, typeof seen>} */
	const byKey = new Map();
	for (const r of seen) byKey.set(r.rkey, [...(byKey.get(r.rkey) || []), r]);
	let newAuthors = 0;
	const records = seen.map((r) => {
		const isNew = Date.parse(r.seenAt) - Date.parse(next.accounts[r.did]) < newAccountDays * DAY;
		const replaces = (byKey.get(r.rkey) || []).some((v) => v.did !== r.did && Date.parse(v.seenAt) < Date.parse(r.seenAt));
		if (!isNew || !replaces) return r;
		newAuthors++;
		return { ...r, newAuthor: /** @type {const} */ (true) };
	});
	return { records, ledger: next, added, newAuthors };
}
