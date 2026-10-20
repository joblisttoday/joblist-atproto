/**
 * Where to go after signing in (/signin?next=/path): only a path on this site.
 * @param {{get(name: string): string | null}} params URL search params
 * @returns {string | null}
 */
export function nextPath(params) {
	const next = params.get('next') || '';
	return /^\/(?![/\\])/.test(next) ? next : null;
}
