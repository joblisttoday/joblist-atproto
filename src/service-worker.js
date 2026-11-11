/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/**
 * joblist kept in this browser, so it opens offline (the local-first practice):
 * - the app's built files, cached at install and served from the cache, replaced by the next version's;
 * - a page opened offline is the app's entry (every page starts the same app).
 * Nothing else is cached here: people's own servers and job boards are read as they are
 * (the app keeps what it needs in IndexedDB).
 */
import { self as worker } from '$app/service-worker';
import { assets, immutable } from '$app/manifest';
import { version } from '$app/env';

const APP = `joblist-app-${version}`;
const SHELL = new URL(worker.registration.scope).pathname;
// The app's own files (listed from the site's root, without its "/"), only: not what other
// sites embed, nor GitHub Pages' settings.
const FILES = [...immutable, ...assets]
	.map(({ path }) => new URL(path, worker.registration.scope).pathname)
	.filter((path) => !/^\/(embed|apps)\/|^\/(CNAME|\.nojekyll|og\.png|ads\.txt)$/.test(path));

worker.addEventListener('install', (event) => {
	event.waitUntil(caches.open(APP).then((cache) => cache.addAll([...FILES, SHELL])));
});

worker.addEventListener('activate', (event) => {
	// The previous version's files go (and the old snapshot's copy: joblist has none now).
	event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== APP).map((key) => caches.delete(key)))));
});

worker.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
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
