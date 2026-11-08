import { afterEach, describe, expect, it, vi } from 'vitest';

const now = new Date().toISOString();
/** @param {string} key @param {[string, string][]} jobs title, published */
const file = (key, jobs) => ({ generatedAt: now, name: key, checked: true, gone: false, points: [], jobs: jobs.map(([t, p]) => ({ t, u: `https://boards.example/${key}/${t}`, c: key, p })) });

/** @param {Record<string, any>} files by path after the snapshot's base */
function serve(files) {
	vi.stubGlobal('fetch', async (/** @type {string} */ url) => {
		const name = decodeURIComponent(String(url).split('/gh-pages/')[1] || '');
		return name in files ? new Response(JSON.stringify(files[name])) : new Response('', { status: 404 });
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe('getCompaniesJobs', () => {
	it("reads only the companies' own files, their jobs newest first", async () => {
		serve({ 'companies/a.org.json': file('a.org', [['A new', '2026-11-05T00:00Z'], ['A old', '2026-10-01T00:00Z']]), 'companies/b.org.json': file('b.org', [['B', '2026-11-01T00:00Z']]) });
		const { getCompaniesJobs } = await import('./snapshot.js');
		const found = await getCompaniesJobs(['a.org', 'b.org']);
		expect(found?.all.map((j) => j.title)).toEqual(['A new', 'B', 'A old']);
		expect(found?.jobs.get('b.org')?.map((j) => j.title)).toEqual(['B']);
		expect([...(found?.checked || [])]).toEqual(['a.org', 'b.org']);
	});

	it('reads every job when one company has no file yet, so none is missed', async () => {
		serve({
			'companies/a.org.json': file('a.org', [['A', '2026-11-05T00:00Z']]),
			'jobs.json': { generatedAt: now, checked: ['a.org', 'new.org'], gone: [], jobs: [{ t: 'A', u: 'https://boards.example/a', c: 'a.org', p: '2026-11-05T00:00Z' }, { t: 'New', u: 'https://boards.example/n', c: 'new.org', p: '2026-11-06T00:00Z' }] }
		});
		const { getCompaniesJobs } = await import('./snapshot.js');
		const found = await getCompaniesJobs(['a.org', 'new.org']);
		expect(found?.jobs.get('new.org')?.map((j) => j.title)).toEqual(['New']);
	});
});

describe('getListJobs', () => {
	const list = { did: 'did:plc:curator', rkey: 'food' };
	const path = 'lists/did:plc:curator/food.json';
	const listFile = { generatedAt: now, name: 'Food', companies: ['a.org', 'b.org'], checked: ['a.org', 'b.org'], gone: [], points: [], jobs: [{ t: 'B', u: 'https://boards.example/b', c: 'b.org', p: '2026-11-06T00:00Z' }, { t: 'A', u: 'https://boards.example/a', c: 'a.org', p: '2026-11-05T00:00Z' }] };

	it("reads the list's own file when it holds the list's organizations", async () => {
		serve({ [path]: listFile });
		const { getListJobs } = await import('./snapshot.js');
		const found = await getListJobs(list, ['b.org', 'a.org']);
		expect(found?.all.map((j) => j.title)).toEqual(['B', 'A']);
		expect(found?.jobs.get('a.org')?.map((j) => j.title)).toEqual(['A']);
	});

	it("reads its organizations' own files when the list changed since the snapshot", async () => {
		serve({ [path]: listFile, 'companies/a.org.json': file('a.org', [['A', '2026-11-05T00:00Z']]), 'companies/c.org.json': file('c.org', [['C', '2026-11-07T00:00Z']]) });
		const { getListJobs } = await import('./snapshot.js');
		const found = await getListJobs(list, ['a.org', 'c.org']);
		expect(found?.all.map((j) => j.title)).toEqual(['C', 'A']);
	});
});
