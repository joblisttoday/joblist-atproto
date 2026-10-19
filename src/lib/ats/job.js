/**
 * @typedef {{
 *   title: string,
 *   url: string,
 *   location?: string,
 *   department?: string,
 *   published?: string,
 *   company: string,
 *   remote?: string,
 *   posted?: {did: string, rkey: string, verified: boolean}
 * }} Job
 *   remote and posted: only for offers posted on joblist (today.joblist.job records).
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
