/// <reference lib="webworker" />
/**
 * joblist used to keep itself offline with a service worker. It no longer does: browsers that
 * kept the old one get this one in its place (it is not registered for anyone new, see
 * vite.config.js), which deletes what was kept, removes itself and reloads the open pages, so
 * they are the site as it is now.
 */
const worker = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

worker.addEventListener('install', () => worker.skipWaiting());
worker.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) await caches.delete(key);
			await worker.registration.unregister();
			for (const client of await worker.clients.matchAll({ type: 'window' })) /** @type {WindowClient} */ (client).navigate(client.url);
		})()
	);
});
