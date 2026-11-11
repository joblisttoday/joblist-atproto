import { describe, expect, it } from 'vitest';
import {
	addCollection,
	collectionOf,
	deleteCollection,
	emptyCollections,
	exportCollections,
	mergeCollections,
	namedWith,
	renameCollection,
	savedIn,
	savedJobs,
	toggleJob
} from './job-collection.js';
import { cleanCollections, fromMarks, readCollectionsFile } from './job-collection-check.js';

const job = { title: 'Designer', company: 'Acme', url: 'https://jobs.example/1' };

describe('job collections', () => {
	it('saves a job in Saved with one tap, beside Applied, and in named collections too', () => {
		let state = toggleJob(emptyCollections(), 'saved', 'k', job, '2026-01-01');
		state = toggleJob(state, 'applied', 'k', job, '2026-01-02');
		expect(collectionOf(state, 'saved')?.jobs.k).toBeDefined();
		const added = addCollection(state, 'Dream jobs');
		state = toggleJob(added.state, added.id, 'k', job);
		expect(savedIn(state, 'k')).toEqual(['saved', added.id]);
		expect(namedWith(state, 'k')).toEqual([added.id]);
		expect(deleteCollection(state, 'saved')).toBe(state);
	});

	it('gives collections kept before Saved existed an empty Saved, keeping their jobs', () => {
		const old = { collections: [{ id: 'applied', name: '', at: '', jobs: { a: { ...job, at: '2026-01-01' } } }, { id: 'hidden', name: '', at: '', jobs: {} }, { id: 'c1', name: 'Dream', at: '2026-01-01', jobs: {} }] };
		const { value, dropped } = cleanCollections(old);
		expect(dropped).toBe(0);
		expect(value.collections.map((c) => c.id)).toEqual(['saved', 'applied', 'hidden', 'c1']);
		expect(collectionOf(value, 'applied')?.jobs.a).toBeDefined();
	});

	it('starts with Applied and Hidden, which exclude each other', () => {
		let state = toggleJob(emptyCollections(), 'applied', 'k', job, '2026-01-01');
		expect(collectionOf(state, 'applied')?.jobs.k).toEqual({ ...job, at: '2026-01-01' });
		state = toggleJob(state, 'hidden', 'k', job, '2026-01-02');
		expect(collectionOf(state, 'applied')?.jobs.k).toBeUndefined();
		expect(collectionOf(state, 'hidden')?.jobs.k).toBeDefined();
		state = toggleJob(state, 'hidden', 'k', job);
		expect(collectionOf(state, 'hidden')?.jobs).toEqual({});
	});

	it('keeps a job in several named collections, renamed and deleted', () => {
		const a = addCollection(emptyCollections(), '  Dream \n jobs ', '2026-01-01');
		const b = addCollection(a.state, 'Later', '2026-01-01');
		expect(a.id).not.toBe(b.id);
		let state = toggleJob(toggleJob(b.state, a.id, 'k', job), b.id, 'k', job);
		toggleJob(state, 'applied', 'k', job);
		expect(namedWith(state, 'k')).toEqual([a.id, b.id]);
		state = renameCollection(state, a.id, 'Dreams');
		expect(collectionOf(state, a.id)?.name).toBe('Dreams');
		expect(collectionOf(a.state, a.id)?.name).toBe('Dream jobs');
		expect(deleteCollection(state, 'applied')).toBe(state);
		expect(namedWith(deleteCollection(state, a.id), 'k')).toEqual([b.id]);
	});

	it('lists the latest saved first', () => {
		let state = toggleJob(emptyCollections(), 'applied', 'old', job, '2026-01-01');
		state = toggleJob(state, 'applied', 'new', job, '2026-02-01');
		expect(savedJobs(/** @type {any} */ (collectionOf(state, 'applied'))).map(([key]) => key)).toEqual(['new', 'old']);
	});

	it('moves the marks of before into Applied and Hidden, without loss', () => {
		const state = fromMarks({
			a: { mark: 'applied', at: '2026-01-01T00:00:00Z', ...job },
			h: { mark: 'hidden', at: '2026-01-02T00:00:00Z', ...job },
			x: { mark: 'other', at: '2026-01-02T00:00:00Z', ...job }
		});
		expect(Object.keys(collectionOf(state, 'applied')?.jobs || {})).toEqual(['a']);
		expect(Object.keys(collectionOf(state, 'hidden')?.jobs || {})).toEqual(['h']);
		expect(fromMarks('nonsense')).toEqual(emptyCollections());
	});

	it('exports and imports all collections, merged with those here', () => {
		const added = addCollection(emptyCollections(), 'Dream jobs', '2026-01-01T00:00:00Z');
		const saved = toggleJob(added.state, added.id, 'k', job, '2026-01-01T00:00:00Z');
		const read = readCollectionsFile(exportCollections(saved)).collections;
		expect(read).toEqual(saved);
		const here = toggleJob(emptyCollections(), 'applied', 'a', job, '2026-01-03T00:00:00Z');
		const merged = mergeCollections(here, read);
		expect(merged.collections.map((c) => c.id)).toEqual(['saved', 'applied', 'hidden', added.id]);
		expect(collectionOf(merged, 'applied')?.jobs.a).toBeDefined();
	});

	it('refuses a file with anything wrong in it', () => {
		const file = (/** @type {any} */ collections) => JSON.stringify({ format: 'joblist.collections', version: 1, collections });
		const named = (/** @type {any} */ jobs, extra = {}) => ({ id: 'c2', name: 'Dream', at: '2026-01-01', jobs, ...extra });
		const ok = { title: 'T', company: 'C', url: 'https://a.example', at: '2026-01-01' };
		expect(() => readCollectionsFile('{')).toThrow('json');
		expect(() => readCollectionsFile('{"collections": []}')).toThrow('format');
		expect(readCollectionsFile(file([named({ k: ok })])).collections.collections).toHaveLength(4);
		expect(() => readCollectionsFile(file([named({ k: { ...ok, url: 'javascript:alert(1)' } })]))).toThrow('invalid');
		expect(() => readCollectionsFile(file([named({ k: { ...ok, title: 7 } })]))).toThrow('invalid');
		expect(() => readCollectionsFile(file([named({ k: { ...ok, title: 'x'.repeat(5000) } })]))).toThrow('invalid');
		expect(() => readCollectionsFile(file([named({}, { name: '' })]))).toThrow('invalid');
		expect(() => readCollectionsFile(file([named({}, { id: '../x' })]))).toThrow('invalid');
		expect(() => readCollectionsFile(file([named({}), named({})]))).toThrow('invalid');
		expect(() => readCollectionsFile(file([{ id: 'applied', name: 'Mine', at: '', jobs: {} }]))).toThrow('invalid');
	});

	it('moves the saved organizations too, and those of the private lists of files from before', () => {
		const org = { url: 'https://a.org', name: 'A', at: '2026-01-01T00:00:00Z', tags: ['coop'] };
		expect(readCollectionsFile(exportCollections(emptyCollections(), [org])).organizations).toEqual([org]);
		const list = { rkey: 'lberlin1', value: { name: 'Coops in Berlin', companies: ['a.org', 'b.org', 'not a domain'], createdAt: 't' } };
		const file = (/** @type {any} */ lists, version = 2) => JSON.stringify({ format: 'joblist.collections', version, collections: [], lists });
		expect(readCollectionsFile(file(undefined, 1)).organizations).toEqual([]);
		expect(readCollectionsFile(file([list])).organizations.map((k) => [k.url, k.tags])).toEqual([
			['https://a.org', ['coops-in-berlin']],
			['https://b.org', ['coops-in-berlin']]
		]);
		expect(() => readCollectionsFile(file([list], 4))).toThrow('format');
	});

	it('keeps what is right from storage', () => {
		const { value, dropped } = cleanCollections({ collections: [{ id: 'applied', name: '', at: '', jobs: { a: { title: 'T', company: '', url: 'ftp://x', at: '2026-01-01' } } }] });
		expect(dropped).toBe(1);
		expect(value).toEqual(emptyCollections());
	});
});
