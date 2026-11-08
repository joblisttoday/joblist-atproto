import settings from '../../src/lib/data/need-lists.json' with { type: 'json' };
import config from '../../src/lib/data/config.json' with { type: 'json' };
import { toDomain } from '../../src/lib/models/company.js';

/**
 * joblist's lists by need, proposed from the commons map (src/lib/data/need-lists.json):
 * for each need, its commons as organizations, those already on joblist and those to
 * describe, with what joblist would write for them. Pure: reads nothing, writes nothing.
 *
 * @typedef {{id: string, name: string, need: string, type?: string, summary?: string, link?: string | null, countries?: string[], actions?: {kind: string, text: string}[], file?: string, checked?: string}} Commons
 * @typedef {{key: string, name: string, link: string, kind: string, network: boolean, countries: string[], summary: string, contribute: {kind: string, text: string}[], source: string, checked: string, known: boolean}} Member
 *   network: many organizations, shown as one entry point (its umbrella's website).
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
 * Whether an entry is many organizations (a network, a federation, a movement), by what its type starts with.
 * @param {Commons} entry
 */
export function isNetwork(entry) {
	const type = (entry.type || '').toLowerCase();
	return settings.networks.starts.some((word) => new RegExp(`^${word}([^a-z]|$)`).test(type));
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
				link: /** @type {string} */ (entry.link),
				kind: kindOf(entry),
				network: isNetwork(entry),
				countries: entry.countries || [],
				summary: entry.summary || '',
				contribute: (entry.actions || []).flatMap((a) => {
					const kind = /** @type {Record<string, string>} */ (settings.contribute)[a.kind];
					return kind ? [{ kind, text: a.text }] : [];
				}),
				source: entry.file || '',
				checked: entry.checked || '',
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
			const about = [m.kind || 'kind unknown', ...(m.network ? ['network'] : []), m.countries.join(' ') || 'no country', m.known ? 'on joblist' : 'to describe'].join(' · ');
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

/**
 * @typedef {{collection: string, action: 'create' | 'update', rkey?: string, value: Record<string, any>}} Write
 *   create without rkey: a list (its server gives it a record key).
 */

/**
 * The organization as joblist describes it: what the map says, credited, its ways to take part.
 * @param {Member} member
 * @param {string} now
 */
export function companyRecord(member, now) {
	const { credit, page } = settings.write;
	const names = new Intl.DisplayNames(['en'], { type: 'region' });
	/** @type {Record<string, any>} */
	const value = {
		$type: config.collections.company,
		name: member.name.slice(0, config.companyForm.nameMax),
		url: member.link,
		description: [member.summary, credit.replace('{page}', page).replace('{checked}', member.checked || 'unknown')].filter(Boolean).join('\n\n'),
		createdAt: now,
		updatedAt: now
	};
	if (member.kind) value.kind = member.kind;
	if (member.network) value.tags = [settings.networks.tag];
	const locations = member.countries.filter((c) => /^[A-Z]{2}$/.test(c)).slice(0, 50).map((code) => ({ country: names.of(code) || code, countryCode: code }));
	if (locations.length) value.locations = locations;
	const contribute = member.contribute.slice(0, config.companyForm.contributeMax).map((c) => ({ kind: c.kind, text: c.text.slice(0, config.companyForm.contributeTextMax) }));
	if (contribute.length) value.contribute = contribute;
	return value;
}

/**
 * What to write so the lists exist with the organizations described so far: new organizations
 * first (at most perRun), then each list, created once and updated after (by its name), its
 * organizations in the map's order after those it already has. Writing it again writes nothing.
 * @param {NeedList[]} lists
 * @param {{own: Set<string>, ownLists: {rkey: string, value: Record<string, any>}[], perRun: number, now: string}} state
 *   own: organizations this account already describes; ownLists: its lists
 * @returns {Write[]}
 */
export function planWrites(lists, { own, ownLists, perRun, now }) {
	/** @type {Write[]} */
	const writes = [];
	const described = new Set(own);
	for (const member of lists.flatMap((l) => l.members)) {
		if (member.known || described.has(member.key) || writes.length >= perRun) continue;
		writes.push({ collection: config.collections.company, action: 'create', rkey: member.key, value: companyRecord(member, now) });
		described.add(member.key);
	}
	const { credit, page } = settings.write;
	for (const list of lists) {
		const ready = list.members.filter((m) => m.known || described.has(m.key)).map((m) => m.key);
		const existing = ownLists.find((l) => l.value.name === list.name);
		if (!existing) {
			if (!ready.length) continue;
			const description = `${list.description}\n\n${credit.replace('{page}', page).replace(', checked {checked}', '')}`;
			writes.push({ collection: config.collections.list, action: 'create', value: { $type: config.collections.list, name: list.name, description, companies: ready, open: true, createdAt: now } });
			continue;
		}
		const companies = [...existing.value.companies, ...ready.filter((key) => !existing.value.companies.includes(key))];
		if (companies.length === existing.value.companies.length) continue;
		writes.push({ collection: config.collections.list, action: 'update', rkey: existing.rkey, value: { ...existing.value, companies } });
	}
	return writes;
}
