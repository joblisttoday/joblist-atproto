/**
 * Minimal XRPC GET over plain `fetch`.
 * Only the safelisted `accept` header is sent, so browsers make a simple
 * request (no CORS preflight), which relays and PDSes accept.
 * @param {string} service
 * @param {string} method
 * @param {Record<string, string | number | boolean | undefined>} [params]
 */
export async function xrpcGet(service, method, params = {}) {
	const url = new URL(`${service.replace(/\/$/, '')}/xrpc/${method}`);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) url.searchParams.set(key, String(value));
	}
	const res = await fetch(url, { headers: { accept: 'application/json' } });
	if (!res.ok) throw Object.assign(new Error(`${method} failed (${res.status})`), { status: res.status });
	return res.json();
}

/**
 * Whether a failed request was answered "no" (it is not there: 400, 404), rather than
 * not answered (offline, a server down): only then is something missing.
 * @param {unknown} err
 */
export function refused(err) {
	const status = /** @type {{status?: number}} */ (err)?.status;
	return typeof status === 'number' && status >= 400 && status < 500;
}

/**
 * Run async tasks with bounded concurrency, keeping input order.
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} fn
 * @returns {Promise<R[]>}
 */
export async function mapLimit(items, limit, fn) {
	const results = new Array(items.length);
	let next = 0;
	const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
		while (next < items.length) {
			const i = next++;
			results[i] = await fn(items[i], i);
		}
	});
	await Promise.all(workers);
	return results;
}
