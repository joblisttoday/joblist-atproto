/**
 * Polite HTTP for the indexer and the maintenance scripts: a User-Agent naming joblist,
 * a timeout on every request, and a log of the responses each task got
 * (so a job fetcher that hides errors can still be told apart from an empty board).
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import config from '../../src/lib/data/config.json' with { type: 'json' };

/** One name for everything joblist asks of others (config.userAgent), with where to read about it. */
export const USER_AGENT = config.userAgent;
export const TIMEOUT_MS = 15000;
const MAX_BYTES = 2_000_000;

/** @typedef {{url: string, status?: number, error?: string}} Hit */

/** @type {AsyncLocalStorage<Hit[]>} */
const hits = new AsyncLocalStorage();
const nativeFetch = globalThis.fetch;

/**
 * fetch with the joblist User-Agent and a timeout.
 * @param {string | URL | Request} input
 * @param {RequestInit} [init]
 */
export async function politeFetch(input, init = {}) {
	// Keep a Request's own headers (e.g. Authorization from @atproto/api).
	const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
	headers.set('user-agent', USER_AGENT);
	const url = String(input instanceof Request ? input.url : input);
	const log = hits.getStore();
	try {
		const res = await nativeFetch(input, { ...init, headers, signal: init.signal || AbortSignal.timeout(TIMEOUT_MS) });
		log?.push({ url, status: res.status });
		return res;
	} catch (error) {
		log?.push({ url, error: reason(error) });
		throw error;
	}
}

/** Make every `fetch` (including the app's job fetchers) polite. */
export function installPoliteFetch() {
	globalThis.fetch = politeFetch;
}

/**
 * Run a task and return the HTTP responses it received.
 * @template T
 * @param {() => Promise<T>} task
 * @returns {Promise<{result: T, hits: Hit[]}>}
 */
export async function withHits(task) {
	/** @type {Hit[]} */
	const log = [];
	const result = await hits.run(log, task);
	return { result, hits: log };
}

/**
 * A short, stable reason for a failed request.
 * @param {any} error
 */
export function reason(error) {
	const cause = error?.cause;
	if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'timeout';
	if (cause?.code) return String(cause.code);
	return String(cause?.message || error?.message || error).slice(0, 120);
}

/**
 * Open a page, following redirects. Never throws.
 * @param {string} url
 * @param {{body?: boolean}} [options] also read the body as text
 * @returns {Promise<{url: string, state: 'ok' | 'blocked' | 'missing' | 'error' | 'unreachable', status?: number, finalUrl?: string, error?: string, text?: string}>}
 */
export async function probe(url, { body = false } = {}) {
	try {
		const res = await politeFetch(url, { redirect: 'follow', headers: { accept: 'text/html,*/*' } });
		const page = { url, status: res.status, finalUrl: res.url, state: pageState(res.status) };
		if (body && res.ok) return { ...page, text: await readText(res) };
		await res.body?.cancel();
		return page;
	} catch (error) {
		return { url, state: 'unreachable', error: reason(error) };
	}
}

/**
 * ok: answers; blocked: exists but refuses robots (403, 429, …);
 * missing: 404/410; error: other server errors.
 * @param {number} status
 * @returns {'ok' | 'blocked' | 'missing' | 'error'}
 */
function pageState(status) {
	if (status < 400) return 'ok';
	if ([401, 403, 406, 429, 999].includes(status)) return 'blocked';
	if ([404, 410].includes(status)) return 'missing';
	return 'error';
}

/** @param {Response} res */
async function readText(res) {
	const reader = res.body?.getReader();
	if (!reader) return '';
	const chunks = [];
	let size = 0;
	while (size < MAX_BYTES) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		size += value.length;
	}
	await reader.cancel();
	return Buffer.concat(chunks).toString('utf8');
}
