/**
 * @typedef {{
 *   title: string,
 *   url: string,
 *   location?: string,
 *   department?: string,
 *   published?: string,
 *   company: string,
 *   id?: string,
 *   remote?: string,
 *   posted?: {did: string, rkey: string, verified: boolean},
 *   also?: Job[],
 *   point?: [number, number],
 *   km?: number
 * }} Job
 *   id: the job's id at its job board, to read its description.
 *   remote: where the work happens (onsite, hybrid or remote), when the board or the poster says.
 *   posted: only for offers posted on joblist (today.joblist.job records).
 *   also: the same offer (same company and title) at its other places, see sameOffers().
 *   point: where it is ([longitude, latitude]), from the snapshot.
 *   km: how far it is from someone, when they search near them.
 */

/**
 * Fetch JSON, returning null on any failure (closed boards answer 404).
 * @param {string} url
 */
export async function getJson(url) {
	try {
		const res = await fetch(url, { headers: { accept: 'application/json' } });
		return res.ok ? await res.json() : null;
	} catch {
		return null;
	}
}

/** @param {...(string | undefined | null)} parts */
export function joinPlace(...parts) {
	return parts.filter(Boolean).join(', ');
}

/**
 * A job board's work place value ('Remote', 'ON_SITE', 'OnSite'…) as onsite, hybrid or remote.
 * @param {unknown} value
 */
export function toWorkplace(value) {
	const text = String(value || '').toLowerCase().replace(/[^a-z]/g, '');
	if (text === 'remote') return 'remote';
	if (text === 'hybrid') return 'hybrid';
	if (text === 'onsite' || text === 'inoffice' || text === 'office') return 'onsite';
	return undefined;
}

/**
 * A function of one id that runs once per id; later calls share its promise.
 * @template T
 * @param {(id: string) => Promise<T>} load
 */
export function onceFor(load) {
	/** @type {Map<string, Promise<T>>} */
	const cache = new Map();
	return (/** @type {string} */ id) => {
		if (!cache.has(id)) cache.set(id, load(id));
		return /** @type {Promise<T>} */ (cache.get(id));
	};
}
