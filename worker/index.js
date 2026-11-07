/**
 * The pages per city and field (/in/berlin, /field/design, /in/berlin/design),
 * their feeds (/feed/…) and their sitemap, rendered from the latest snapshot.
 *
 * Only these addresses reach this Worker (wrangler.jsonc: assets.run_worker_first);
 * every other file is served as before, without it. Each answer is made from one
 * small snapshot file (indexer/landing.js), then kept in the cache for
 * config.landing.cacheSeconds: most requests only read the cache.
 *
 * Bindings: ASSETS (the built site, for the app's shell and the 404 page);
 * SNAPSHOT (optional, local development: where the snapshot is instead of config.snapshot.path).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { page } from '../indexer/html.js';
import { headers, pagePolicy } from './http.js';
import { unavailableMeta } from './pages.js';
import { render } from './render.js';
import { fileOf, pathOf, route } from './routes.js';

/**
 * @typedef {{ASSETS: {fetch: typeof fetch}, SNAPSHOT?: string}} Env
 * @typedef {{waitUntil: (promise: Promise<unknown>) => void}} Context
 */

/** The app's shell, read once per instance (it changes only with a deploy, which starts new ones). */
/** @type {Promise<string> | null} */
let shell = null;

/** @param {Env} env @param {URL} url */
function template(env, url) {
	shell ??= env.ASSETS.fetch(new Request(new URL('/', url))).then((res) => {
		if (!res.ok) throw new Error(`shell: ${res.status}`);
		return res.text();
	});
	// A failed read is tried again by the next request.
	shell.catch(() => (shell = null));
	return shell;
}

/**
 * A snapshot file, cached at the edge (it changes every few hours).
 * @param {Env} env
 * @param {string} name
 * @returns {Promise<any>} null: no such file (not enough jobs for that page)
 */
async function snapshotFile(env, name) {
	const { snapshotCacheSeconds, missingCacheSeconds } = config.landing;
	const res = await fetch(`${env.SNAPSHOT || config.snapshot.path}/${name}`, {
		// @ts-ignore Cloudflare's own fetch options
		cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': snapshotCacheSeconds, 404: missingCacheSeconds, '500-599': 0 } }
	});
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`${name}: ${res.status}`);
	return res.json();
}

/**
 * @param {Request} request
 * @param {Env} env
 * @param {Context} ctx
 */
async function answer(request, env, ctx) {
	const url = new URL(request.url);
	const found = route(url.pathname);
	// Not ours (wrong slug, unknown field): the site's 404 page.
	if (!found) return env.ASSETS.fetch(request);
	if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	if (found.kind === 'redirect') return new Response(null, { status: 301, headers: { Location: found.location } });

	// One cached answer per page, whatever the query string.
	const key = new Request(url.origin + pathOf(found));
	const cache = /** @type {any} */ (caches).default;
	const cached = await cache.match(key);
	if (cached) return cached;

	const shell = found.kind === 'feed' || found.kind === 'sitemap' ? '' : await template(env, url);
	let data;
	try {
		data = await snapshotFile(env, fileOf(found));
	} catch {
		const body = shell ? page(shell, unavailableMeta(pathOf(found))) : '';
		return new Response(body, { status: 503, headers: headers(shell ? 'html' : 'xml', { status: 503, policy: pagePolicy(shell) }) });
	}
	if (!data) return env.ASSETS.fetch(request);
	const { body, type } = render(found, data, shell);
	const response = new Response(body, { headers: headers(type, { policy: pagePolicy(shell) }) });
	ctx.waitUntil(cache.put(key, response.clone()));
	return response;
}

export default {
	/**
	 * @param {Request} request
	 * @param {Env} env
	 * @param {Context} ctx
	 */
	async fetch(request, env, ctx) {
		const response = await answer(request, env, ctx);
		// HEAD: the same headers, no body.
		return request.method === 'HEAD' ? new Response(null, response) : response;
	}
};
