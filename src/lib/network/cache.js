import config from '#lib/data/config.json' with { type: 'json' };
import { keep, readKept } from '#lib/local/store.js';

const KEY = 'network.v2';
/** Where it was kept before (localStorage, about 5 MB at most): moved once. */
const OLD = 'joblist.network.v1';

/**
 * @typedef {{loadedAt: string | null, companyRecords: any[], listRecords: any[], suggestionRecords: any[], jobRecords: any[], profiles: Record<string, any>}} Cached
 */

/**
 * A per-browser copy of the last network load, so pages show at once and offline.
 * The network stays the source of truth; this may be missing at any time.
 * @returns {Promise<Cached | null>}
 */
export async function readCache() {
	const kept = await readKept(KEY);
	if (kept) return kept;
	try {
		const raw = localStorage.getItem(OLD);
		if (!raw) return null;
		localStorage.removeItem(OLD);
		const moved = JSON.parse(raw);
		keep(KEY, moved);
		return moved;
	} catch {
		return null;
	}
}

/** @type {ReturnType<typeof setTimeout> | undefined} */
let timer;

/**
 * Keep the network as it is now: once, after a burst of changes.
 * @param {Cached} state plain data
 */
export function writeCache({ loadedAt, companyRecords, listRecords, suggestionRecords, jobRecords, profiles }) {
	clearTimeout(timer);
	timer = setTimeout(() => keep(KEY, { loadedAt, companyRecords, listRecords, suggestionRecords, jobRecords, profiles }), config.cache.writeDelayMs);
}
