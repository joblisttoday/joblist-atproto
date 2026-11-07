import { safeUrl } from './url.js';
import { unpackSalary } from '../ats/salary.js';

/**
 * A job as the snapshot keeps it (see indexer/jobs.js), as the app uses it.
 * Posted jobs come from their records, read with the others (they may be edited or deleted since).
 * Where the work happens was read by the indexer from the board, the location and the title:
 * none said is '' ("not said"), so the app does not read every job again (see workplace).
 * @param {any} j
 * @returns {import('#lib/ats/job.js').Job | null}
 */
export function fromSnapshot(j) {
	if (j.s?.startsWith('at://')) return null;
	const url = safeUrl(j.u);
	if (!url) return null;
	// The id at its board is left out when the link ends with it.
	const id = j.i ?? url.slice(url.lastIndexOf('/') + 1);
	return { title: j.t, url, company: j.c, location: j.l, department: j.d, published: j.p, id, remote: j.r || '', point: j.g, salary: unpackSalary(j.m) };
}
