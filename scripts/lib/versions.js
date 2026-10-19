/**
 * Which version of a company the crawler builds on, and when it must stay away.
 *
 * Rules (see docs/crawler.md):
 * - the company's own record (author handle = record key) is never touched;
 * - a version written by a person after the health check is never overridden;
 * - once a person edits a company after the crawler did, the crawler backs off for good;
 * - the crawler never deletes: it only writes its own version in its own repo.
 *
 * Pure functions, unit tested in versions.test.js.
 */

/**
 * @typedef {{did: string, rkey: string, uri: string, cid?: string, value: Record<string, any>}} RepoRecord
 * @typedef {Map<string, {handle: string}>} Profiles
 * @typedef {{botDid: string, bots?: string[], checkedAt: string}} Context
 */

/** When a version was last edited. @param {RepoRecord} record */
export const editedAt = (record) => String(record.value.updatedAt || record.value.createdAt || '');

/** @param {RepoRecord} record @param {Profiles} profiles */
export const isOwn = (record, profiles) => profiles.get(record.did)?.handle === record.rkey;

/** @param {string} did @param {Context} ctx */
export const isBot = (did, ctx) => did === ctx.botDid || (ctx.bots || []).includes(did);

/**
 * The version shown to everyone: the company's own, otherwise the most recently edited.
 * @param {RepoRecord[]} versions
 * @param {Profiles} profiles
 */
export function displayedVersion(versions, profiles) {
	return versions.find((v) => isOwn(v, profiles)) || [...versions].sort((a, b) => editedAt(b).localeCompare(editedAt(a)))[0];
}

/**
 * Whether the crawler may write its version of a company, and on top of which version.
 * @param {RepoRecord[]} versions every version of one company
 * @param {Profiles} profiles
 * @param {Context} ctx
 * @returns {{base: RepoRecord, mine?: RepoRecord} | {skip: string}}
 */
export function decide(versions, profiles, ctx) {
	if (versions.some((v) => isOwn(v, profiles))) return { skip: 'the company wrote its own record' };
	const base = displayedVersion(versions, profiles);
	const mine = versions.find((v) => v.did === ctx.botDid);
	const humans = versions.filter((v) => !isBot(v.did, ctx));
	if (!isBot(base.did, ctx) && editedAt(base) > ctx.checkedAt) return { skip: 'a person edited it after the health check' };
	if (mine && humans.some((v) => editedAt(v) > editedAt(mine))) return { skip: 'a person edited it after the crawler' };
	return mine ? { base, mine } : { base };
}

/**
 * The crawler's version: the displayed one with only the repaired fields changed.
 * Returns null when the changes change nothing.
 * @param {RepoRecord} base
 * @param {Record<string, any>} changes
 * @param {RepoRecord | undefined} mine the crawler's current version, if any
 * @param {string} now ISO date
 */
export function botVersion(base, changes, mine, now) {
	const changed = Object.entries(changes).filter(([field, value]) => JSON.stringify(base.value[field]) !== JSON.stringify(value));
	if (!changed.length) return null;
	return {
		...base.value,
		...Object.fromEntries(changed),
		$type: 'today.joblist.company',
		createdAt: mine?.value.createdAt || now,
		updatedAt: now
	};
}
