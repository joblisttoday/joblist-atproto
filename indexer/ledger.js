/**
 * When each offer was first seen: job boards often post an old offer again with
 * a new date, and some give no date at all. The ledger keeps, per offer (company,
 * title and place: an opening in a new city is new there), the earliest date known
 * for it and when it was last seen, from run to run (published as offers.json).
 *
 * A job's date (`p`) becomes the offer's first date, so "new" means new:
 * - an offer seen before keeps its first date, whatever date its board gives now;
 * - a new offer keeps its board's date;
 * - a new offer without one is dated now, unless its company is new to the
 *   ledger (its jobs were not just published: we just started reading them).
 * An offer not seen for `keepDays` is forgotten.
 *
 * @typedef {import('./jobs.js').IndexedJob} IndexedJob
 * @typedef {Record<string, [first: string, last: string]>} Ledger
 *   first: earliest date known ("" when none), last: last run it was seen.
 */

/** @param {IndexedJob} job */
export const offerKey = (job) => `${job.c}\n${job.t.trim().toLowerCase()}\n${(job.l || '').trim().toLowerCase()}`;

/**
 * Give board jobs their offer's first date, and the ledger after this run.
 * Jobs posted on atproto (`s`) keep their own date: their poster renews them.
 * @param {IndexedJob[]} jobs changed in place
 * @param {Ledger} ledger as of the last run (not changed)
 * @param {string} now this run, to the minute ("2026-11-06T18:00Z")
 * @param {number} keepDays
 * @returns {{ledger: Ledger, reposted: number, dated: number}}
 */
export function dateOffers(jobs, ledger, now, keepDays) {
	/** @type {Ledger} */
	const next = {};
	const knownCompanies = new Set(Object.keys(ledger).map((key) => key.slice(0, key.indexOf('\n'))));
	let reposted = 0;
	let dated = 0;
	for (const job of jobs) {
		if (job.s) continue;
		const key = offerKey(job);
		const known = next[key] || ledger[key];
		let first = known ? earliest(known[0], job.p) : job.p || '';
		if (!first && !known && knownCompanies.has(job.c)) first = now;
		if (ledger[key] && job.p && first !== job.p) reposted++;
		if (first && !job.p) dated++;
		if (first) job.p = first;
		next[key] = [first, now];
	}
	// Offers not seen this run, kept a while: a board that failed once must not make them new.
	const keepFrom = new Date(Date.parse(now) - keepDays * 864e5).toISOString().slice(0, 16) + 'Z';
	for (const [key, entry] of Object.entries(ledger)) if (!next[key] && entry[1] >= keepFrom) next[key] = entry;
	return { ledger: next, reposted, dated };
}

/** @param {string} a @param {string | undefined} b dates as ISO strings, "" for none */
function earliest(a, b) {
	if (!a) return b || '';
	if (!b) return a;
	return Date.parse(b) < Date.parse(a) ? b : a;
}
