const KEY = 'joblist.network.v1';

/**
 * A per-browser copy of the last network load, so pages show at once.
 * The network stays the source of truth; this may be missing at any time.
 */
export function readCache() {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

/** @param {{loadedAt: string | null, companyRecords: any[], listRecords: any[], suggestionRecords: any[], jobRecords: any[], profiles: Record<string, any>}} state */
export function writeCache({ loadedAt, companyRecords, listRecords, suggestionRecords, jobRecords, profiles }) {
	try {
		localStorage.setItem(KEY, JSON.stringify({ loadedAt, companyRecords, listRecords, suggestionRecords, jobRecords, profiles }));
	} catch {
		// storage full or blocked: the app works without it
	}
}
