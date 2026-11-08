import settings from '../../src/lib/data/need-lists.json' with { type: 'json' };
import { toDomain } from '../../src/lib/models/company.js';

/**
 * joblist's lists by need, proposed from the commons map (src/lib/data/need-lists.json):
 * for each need, its commons as organizations, those already on joblist and those to
 * describe, with what joblist would write for them. Pure: reads nothing, writes nothing.
 *
 * @typedef {{id: string, name: string, need: string, type?: string, summary?: string, link?: string | null, countries?: string[], actions?: {kind: string, text: string}[], file?: string, checked?: string}} Commons
 * @typedef {{key: string, name: string, kind: string, countries: string[], summary: string, contribute: {kind: string, text: string}[], source: string, known: boolean}} Member
 * @typedef {{need: string, name: string, description: string, members: Member[], skipped: {name: string, reason: string}[]}} NeedList
 */

/**
 * What sort of organization a commons is, when its type or summary says it clearly.
 * @param {Commons} entry
 * @returns {string} '' when unclear
 */
export function kindOf(entry) {
	// "NOT a co-op", "NOT member-owned": what follows "not" never counts.
	const clean = (/** @type {string | undefined} */ text) => (text || '').toLowerCase().replace(/\bnot (an? )?[\w-]+/g, '');
	const texts = {
		// What it is, before what it works with: "a network of communities with support NGOs" is no NGO.
		type: clean(entry.type).split(/\s+with\s+|\s+plus\s+|\s\+\s|;/)[0],
		// A summary says what it is first ("A Flemish co-op where…"), what it does after ("…lending to co-ops").
		summary: clean(entry.summary).split(/\s+/).slice(0, 6).join(' ')
	};
	// A word alone or as a plural ("co-ops"), never inside another ("scoop").
	const has = (/** @type {string} */ text, /** @type {string} */ word) => new RegExp(`(^|[^a-z])${word.replace(/-/g, '\\-')}s?([^a-z]|$)`).test(text);
	const rule = settings.kinds.find((r) => r.in.some((field) => r.words.some((word) => has(texts[/** @type {'type' | 'summary'} */ (field)], word))));
	return rule?.kind || '';
}

/**
 * @param {Commons[]} commons the map's entries
 * @param {Set<string>} known organizations already on joblist, by key
 * @returns {NeedList[]}
 */
export function proposeNeedLists(commons, known) {
	return settings.lists.map(({ need, name, description }) => {
		/** @type {Member[]} */
		const members = [];
		/** @type {{name: string, reason: string}[]} */
		const skipped = [];
		const seen = new Set();
		for (const entry of commons.filter((c) => c.need === need)) {
			const key = entry.link && entry.link !== 'unknown' ? toDomain(entry.link) : '';
			if (!key) {
				skipped.push({ name: entry.name, reason: 'no website' });
				continue;
			}
			if (seen.has(key)) {
				skipped.push({ name: entry.name, reason: `same website as another (${key})` });
				continue;
			}
			seen.add(key);
			members.push({
				key,
				name: entry.name,
				kind: kindOf(entry),
				countries: entry.countries || [],
				summary: entry.summary || '',
				contribute: (entry.actions || []).flatMap((a) => {
					const kind = /** @type {Record<string, string>} */ (settings.contribute)[a.kind];
					return kind ? [{ kind, text: a.text }] : [];
				}),
				source: entry.file || '',
				known: known.has(key)
			});
		}
		return { need, name, description, members, skipped };
	});
}

/**
 * The proposal as a report to read before anything is written.
 * @param {NeedList[]} lists
 * @param {{source: string, readAt: string}} about
 */
export function needListsReport(lists, { source, readAt }) {
	const all = lists.flatMap((l) => l.members);
	const lines = [
		'# Lists by need: proposal (dry run, nothing written)',
		'',
		`From ${source}, read ${readAt}. ${lists.length} lists, ${all.length} organizations (${all.filter((m) => m.known).length} already on joblist), ${lists.reduce((n, l) => n + l.skipped.length, 0)} left out.`,
		`Kinds read: ${countBy(all.map((m) => m.kind || 'unknown'))}. With ways to contribute: ${all.filter((m) => m.contribute.length).length}.`,
		''
	];
	for (const list of lists) {
		lines.push(`## ${list.name} (${list.members.length})`, '', list.description, '');
		for (const m of list.members) {
			const about = [m.kind || 'kind unknown', m.countries.join(' ') || 'no country', m.known ? 'on joblist' : 'to describe'].join(' · ');
			lines.push(`- **${m.name}** (${m.key}): ${about}. ${m.summary}`);
			for (const c of m.contribute) lines.push(`  - ${c.kind}: ${c.text}`);
		}
		for (const s of list.skipped) lines.push(`- ~~${s.name}~~: left out, ${s.reason}`);
		lines.push('');
	}
	return lines.join('\n');
}

/** @param {string[]} values */
function countBy(values) {
	const counts = new Map();
	for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
	return [...counts].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${n} ${v}`).join(', ');
}
