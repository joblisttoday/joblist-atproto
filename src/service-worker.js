/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/**
 * joblist kept in this browser, so it opens and searches offline on what it read last
 * (the local-first practice; enform's service worker is the model). SvelteKit's way:
 * - the app's built files, cached at install and served from the cache, replaced by the next version's;
 * - a page opened offline is the app's entry (every page starts the same app);
 * - the snapshot's files (config.snapshot.path): from the network, kept for later; when it
 *   is slow (config.serviceWorker.snapshotWaitMs) or unreachable, the copy kept, while the
 *   network's answer still replaces it for next time.
 * Nothing else is cached here: people's own servers, job boards and other services are
 * read as they are (the app keeps what it needs in IndexedDB).
 */
import { self as worker } from '$app/service-worker';
import { assets, immutable } from '$app/manifest';
import { version } from '$app/env';
import config from '#lib/data/config.json';

const APP = `joblist-app-${version}`;
const DATA = 'joblist-snapshot';
const SHELL = new URL(worker.registration.scope).pathname;
// The app's own files (listed from the site's root, without its "/"), only: not the snapshot
// copy used in development, nor what other sites embed, nor Cloudflare's settings.
const FILES = [...immutable, ...assets]
	.map(({ path }) => new URL(path, worker.registration.scope).pathname)
	.filter((path) => !/^\/(snapshot|embed)\/|^\/(_redirects|_headers|og\.png|ads\.txt)$/.test(path));
const SNAPSHOT = `${config.snapshot.path}/`;

worker.addEventListener('install', (event) => {
	event.waitUntil(caches.open(APP).then((cache) => cache.addAll([...FILES, SHELL])));
});

worker.addEventListener('activate', (event) => {
	// The previous version's files go; the snapshot's stay (they are data, not the app).
	event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== APP && key !== DATA).map((key) => caches.delete(key)))));
});

worker.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (request.url.startsWith(SNAPSHOT)) return event.respondWith(snapshotFile(request, event));
	if (url.origin !== location.origin) return;
	if (FILES.includes(url.pathname)) return event.respondWith(fromCache(request));
	if (request.mode === 'navigate') return event.respondWith(page(request));
});

/** The app's own file: never changes within a version. @param {Request} request */
async function fromCache(request) {
	return (await caches.match(request, { cacheName: APP })) ?? fetch(request);
}

/** A page: the network's, or offline the app's entry. @param {Request} request */
async function page(request) {
	try {
		return await fetch(request);
	} catch (err) {
		const shell = await caches.match(SHELL, { cacheName: APP });
		if (shell) return shell;
		throw err;
	}
}

/**
 * A snapshot file: the network's when it answers in time, kept for later; else the copy kept.
 * @param {Request} request
 * @param {ExtendableEvent} event
 */
async function snapshotFile(request, event) {
	const cache = await caches.open(DATA);
	const fresh = fetch(request).then(async (response) => {
		if (response.ok) {
			await cache.put(request, response.clone());
			await trim(cache);
		}
		return response;
	});
	// Answered late: still kept for the next time.
	event.waitUntil(fresh.catch(() => {}));
	const kept = await cache.match(request);
	if (!kept) return fresh;
	const late = new Promise((resolve) => setTimeout(resolve, config.serviceWorker.snapshotWaitMs, kept));
	return Promise.race([fresh.catch(() => kept), late]);
}

/**
 * The oldest kept files go past config.serviceWorker.snapshotFilesKept (each company,
 * list and page has its small file: a long visit reads many).
 * @param {Cache} cache
 */
async function trim(cache) {
	const keys = await cache.keys();
	const over = keys.length - config.serviceWorker.snapshotFilesKept;
	for (const key of keys.slice(0, Math.max(0, over))) await cache.delete(key);
}
