import config from '../src/lib/data/config.json' with { type: 'json' };
import { feedPath, fieldOf, indexFile, isCompanyKey, isSlug, landingFile, landingPath } from '../src/lib/models/landing.js';

/**
 * The addresses this Worker answers (wrangler.jsonc: assets.run_worker_first),
 * read from the path alone. Anything else, or any piece that is not a known
 * field, a plain slug or a company key, is not ours: the static 404 answers.
 *
 * @typedef {{kind: 'cities'} | {kind: 'fields'} | {kind: 'sitemap'}
 *   | {kind: 'page', city?: string, field?: string}
 *   | {kind: 'feed', city?: string, field?: string, company?: string}
 *   | {kind: 'redirect', location: string}} Route
 */

/**
 * @param {string} pathname as in a URL: percent-encoded, so anything unusual fails the slug checks
 * @returns {Route | null}
 */
export function route(pathname) {
	// A trailing slash leads to the same page without it: rebuilt from the route, never from the request.
	if (pathname.length > 1 && pathname.endsWith('/')) {
		const found = route(pathname.slice(0, -1));
		const location = found && pathOf(found);
		return location ? { kind: 'redirect', location } : null;
	}
	if (pathname === config.landing.sitemap) return { kind: 'sitemap' };
	const [, first, ...rest] = pathname.split('/');
	if (first === 'in') return page(rest, 'city');
	if (first === 'field') return page(rest, 'field');
	if (first === 'feed') return feed(rest);
	return null;
}

/**
 * @param {string[]} parts after /in or /field
 * @param {'city' | 'field'} by
 * @returns {Route | null}
 */
function page(parts, by) {
	if (!parts.length) return { kind: by === 'city' ? 'cities' : 'fields' };
	const pieces = pick(parts, by);
	return pieces && { kind: 'page', ...pieces };
}

/** @param {string[]} parts after /feed @returns {Route | null} */
function feed(parts) {
	const last = parts.at(-1) || '';
	if (!last.endsWith('.xml')) return null;
	const [by, ...rest] = [...parts.slice(0, -1), last.slice(0, -'.xml'.length)];
	if (by === 'new' && !rest.length) return { kind: 'feed' };
	if (by === 'company' && rest.length === 1 && isCompanyKey(rest[0])) return { kind: 'feed', company: rest[0] };
	if (by !== 'in' && by !== 'field') return null;
	const pieces = rest.length && pick(rest, by === 'in' ? 'city' : 'field');
	return pieces ? { kind: 'feed', ...pieces } : null;
}

/**
 * @param {string[]} parts
 * @param {'city' | 'field'} by
 * @returns {{city?: string, field?: string} | null}
 */
function pick(parts, by) {
	if (by === 'field') return parts.length === 1 && fieldOf(parts[0]) ? { field: parts[0] } : null;
	const [city, field] = parts;
	if (parts.length > 2 || !isSlug(city)) return null;
	if (parts.length === 1) return { city };
	return fieldOf(field) ? { city, field } : null;
}

/**
 * The canonical path of a route.
 * @param {Route} found
 */
export function pathOf(found) {
	switch (found.kind) {
		case 'cities':
			return landingPath({});
		case 'fields':
			return '/field';
		case 'sitemap':
			return config.landing.sitemap;
		case 'page':
			return landingPath(found);
		case 'feed':
			return feedPath(found);
		default:
			return '';
	}
}

/**
 * The snapshot file a route is made from.
 * @param {Route} found
 */
export function fileOf(found) {
	if (found.kind === 'feed' && found.company) return `${config.embed.dir}/${found.company}.json`;
	if (found.kind === 'page' || found.kind === 'feed') return landingFile(found);
	return indexFile();
}
