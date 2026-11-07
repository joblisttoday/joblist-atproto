/**
 * What a page shows (its search, filters, view, the job open) is kept in the
 * address, so any state is a link to keep or share: after the "#" (/#q=design&where=Berlin),
 * which browsers never send, so no server, cache or log ever sees what someone searches.
 * Older links kept it in the query (?q=…): still read, and moved after the "#".
 * Pages themselves stay real paths (/company/acme.org, /in/berlin) for search engines.
 */

/** A sign-in coming back puts its own answer after the "#": left alone until it is read. */
export function signingIn(hash = location.hash) {
	return /[#&]state=/.test(hash) && /[#&](code|error)=/.test(hash);
}

/**
 * The state in an address: after the "#", over the older query.
 * @param {string[]} keys the page's own parameters (a query has others: ?page=2, ?suggest)
 * @param {{search: string, hash: string}} [at]
 */
export function readAddress(keys, at = location) {
	const found = new URLSearchParams();
	const query = new URLSearchParams(at.search);
	const hash = signingIn(at.hash) ? new URLSearchParams() : new URLSearchParams(at.hash.slice(1));
	for (const key of keys) {
		const value = hash.get(key) ?? query.get(key);
		if (value !== null) found.set(key, value);
	}
	return found;
}

/**
 * An address with a page's state after the "#", in the given order, without empty values
 * (true: a flag, "pay=1"); its own keys left out of the query.
 * @param {Record<string, string | number | boolean | null | undefined>} state
 * @param {string} [path] the page's path, with its own query (?page=2): the current one by default
 */
export function addressOf(state, path = location.pathname + location.search) {
	const [pathname, search = ''] = path.split('?');
	const query = new URLSearchParams(search);
	const hash = new URLSearchParams();
	for (const [key, value] of Object.entries(state)) {
		query.delete(key);
		if (value === true) hash.set(key, '1');
		else if (value || value === 0) hash.set(key, String(value).trim());
	}
	for (const [key, value] of [...hash]) if (!value) hash.delete(key);
	const q = query.toString();
	const h = hash.toString();
	return `${pathname}${q ? `?${q}` : ''}${h ? `#${h}` : ''}`;
}

/** The current address, as addressOf writes it (to compare). */
export const currentAddress = () => location.pathname + location.search + location.hash;

/**
 * Keeps a page's state in its address, replacing it (no history entry for each letter typed);
 * not while a sign-in's answer is in it.
 * @param {Record<string, string | number | boolean | null | undefined>} state
 * @param {(url: string) => void} replace SvelteKit's replaceState, with the page's state
 */
export function keepAddress(state, replace) {
	if (signingIn()) return;
	const wanted = addressOf(state);
	if (wanted !== currentAddress()) replace(wanted);
}
