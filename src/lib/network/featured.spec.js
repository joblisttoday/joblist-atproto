import { beforeEach, describe, expect, it, vi } from 'vitest';

const DAY = 24 * 3600 * 1000;
/** @type {import('#lib/models/featured.js').Featured} */
const active = { id: 'a', job: { kind: 'record', uri: 'at://did:plc:a/today.joblist.job/1' }, until: new Date(Date.now() + DAY).toISOString(), paidAt: '2026-10-01T00:00:00Z' };
const ended = { ...active, id: 'b', until: new Date(Date.now() - DAY).toISOString() };

/** A fresh module each time: it loads once per visit. */
const load = async () => import('./featured.svelte.js');

describe('loadFeatured', () => {
	beforeEach(() => vi.resetModules());

	it('keeps the jobs featured now', async () => {
		const { featured, loadFeatured } = await load();
		await loadFeatured(async () => Response.json([active, ended, { nonsense: true }]));
		expect(featured.items.map((i) => i.id)).toEqual(['a']);
	});

	it('features nothing when the Worker is missing or fails', async () => {
		for (const fetcher of [async () => new Response('', { status: 404 }), async () => Promise.reject(new Error('offline'))]) {
			vi.resetModules();
			const { featured, loadFeatured } = await load();
			await loadFeatured(fetcher);
			expect(featured.items).toEqual([]);
		}
	});
});

describe('registerIntent', () => {
	it('sends the job and its id', async () => {
		const { registerIntent } = await load();
		/** @type {any} */
		let sent;
		const id = await registerIntent(active.job, async (_url, init) => ((sent = JSON.parse(String(init?.body))), Response.json({})));
		expect(sent).toEqual({ id, job: active.job });
	});

	it('fails when the Worker refuses', async () => {
		const { registerIntent } = await load();
		await expect(registerIntent(active.job, async () => new Response('', { status: 503 }))).rejects.toThrow('503');
	});
});
