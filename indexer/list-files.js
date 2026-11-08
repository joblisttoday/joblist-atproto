import { membership, toList } from '../src/lib/models/list.js';
import { toSuggestion } from '../src/lib/models/suggestion.js';
import { postPoints, publicJobs } from './company-files.js';

/**
 * One small file per list (lists/{did}/{rkey}.json): its organizations' open jobs, newest
 * first, for its page here, its embed on other sites and its feed, instead of every job.
 * Its organizations as the list shows them (an open list's suggested ones too), so the app
 * can tell whether the list changed since. One more file per list, never a bigger one.
 *
 * @typedef {import('./jobs.js').IndexedJob} IndexedJob
 * @typedef {import('../src/lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{generatedAt: string, name: string, companies: string[], names: Record<string, string>, checked: string[], gone: string[], jobs: IndexedJob[], points: [string, [number, number]][]}} ListFile
 *   companies: its organizations' keys; names: their names, for an embed to show;
 *   checked: those whose board was read; gone: those whose board closed.
 */

/**
 * @param {RepoRecord[]} listRecords
 * @param {RepoRecord[]} suggestionRecords
 * @param {IndexedJob[]} jobs
 * @param {{generatedAt: string, checked: Iterable<string>, gone: Iterable<string>, names?: Map<string, string>}} snapshot
 *   names: organizations' names by key
 * @returns {[string, ListFile][]} by path under lists/ ({did}/{rkey})
 */
export function listFiles(listRecords, suggestionRecords, jobs, { generatedAt, checked, gone, names = new Map() }) {
	const read = new Set(checked);
	const closed = new Set(gone);
	const suggestions = suggestionRecords.filter((r) => r.value?.list && r.value?.company).map(toSuggestion);
	/** @type {Map<string, IndexedJob[]>} */
	const byCompany = new Map();
	for (const job of jobs) {
		const list = byCompany.get(job.c);
		if (list) list.push(job);
		else byCompany.set(job.c, [job]);
	}
	return listRecords
		.filter((r) => r.value?.name)
		.map((record) => {
			const list = toList(record);
			const keys = [...new Set(membership(list, suggestions).members.map((m) => m.key))];
			const all = keys.flatMap((key) => byCompany.get(key) || []);
			/** @type {ListFile} */
			const file = {
				generatedAt,
				name: list.name,
				companies: keys,
				names: Object.fromEntries(keys.flatMap((key) => (names.has(key) ? [[key, names.get(key)]] : []))),
				checked: keys.filter((key) => read.has(key)),
				gone: keys.filter((key) => closed.has(key)),
				jobs: publicJobs(all),
				points: postPoints(all)
			};
			return /** @type {[string, ListFile]} */ ([`${list.did}/${list.rkey}`, file]);
		});
}
