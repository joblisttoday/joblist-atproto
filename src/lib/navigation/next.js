/**
 * Where to go after signing in (/signin?next=/path): only a path on this site.
 * @param {{get(name: string): string | null}} params URL search params
 * @returns {string | null}
 */
export function nextPath(params) {
	const next = params.get('next') || '';
	// No control characters either: browsers drop tabs and line breaks, so "/\t/x" would become "//x".
	return /^\/(?![/\\])/.test(next) && !/[\u0000-\u001f\u007f]/.test(next) ? next : null;
}
