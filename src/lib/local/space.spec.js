import { describe, expect, it } from 'vitest';
import { mergeProfiles } from './space.js';

/** A localStorage stand-in. */
function memory(entries = {}) {
	const data = new Map(Object.entries(entries));
	return /** @type {Storage} */ ({
		get length() {
			return data.size;
		},
		key: (i) => [...data.keys()][i] ?? null,
		getItem: (k) => data.get(k) ?? null,
		setItem: (k, v) => void data.set(k, String(v)),
		removeItem: (k) => void data.delete(k),
		clear: () => data.clear()
	});
}

/** @param {string} query */
const search = (query) => ({ query, where: '', remote: '', seen: '2026-11-01T00:00:00.000Z' });
/** @param {string} title */
const job = (title) => ({ title, company: 'Ableton', url: `https://jobs.example/${title}`, at: '2026-11-01T00:00:00.000Z' });
/** @param {string} rkey @param {string[]} companies */
const list = (rkey, companies) => ({ uri: `at://local/today.joblist.list/${rkey}`, cid: '', did: 'local', rkey, value: { name: rkey, companies, createdAt: '2026-11-01T00:00:00.000Z' } });

describe('one space', () => {
	it('merges what older profiles kept into it, once, and removes their copies', () => {
		const store = memory({
			'joblist.searches.v1': JSON.stringify([search('design')]),
			'joblist.searches.v1:pwork': JSON.stringify([search('design'), search('svelte')]),
			'joblist.collections.v1': JSON.stringify({ collections: [{ id: 'saved', name: '', at: '', jobs: { a: job('a') } }] }),
			'joblist.collections.v1:pwork': JSON.stringify({ collections: [{ id: 'saved', name: '', at: '', jobs: { b: job('b') } }] }),
			'joblist.lists.v1:pwork': JSON.stringify([list('lsaved', ['ableton.com'])]),
			'joblist.lists.v1': JSON.stringify([list('lsaved', ['mozilla.org'])]),
			'joblist.jobDraft.v1:pwork': '{"title":"Old"}'
		});
		mergeProfiles(store);
		expect(JSON.parse(/** @type {string} */ (store.getItem('joblist.searches.v1'))).map((/** @type {any} */ s) => s.query)).toEqual(['design', 'svelte']);
		const saved = JSON.parse(/** @type {string} */ (store.getItem('joblist.collections.v1'))).collections.find((/** @type {any} */ c) => c.id === 'saved');
		expect(Object.keys(saved.jobs).sort()).toEqual(['a', 'b']);
		expect(JSON.parse(/** @type {string} */ (store.getItem('joblist.lists.v1')))[0].value.companies).toEqual(['mozilla.org', 'ableton.com']);
		expect(store.getItem('joblist.jobDraft.v1')).toBe(null);
		expect(store.getItem('joblist.searches.v1:pwork')).toBe(null);
		// Once: a later copy is not merged again.
		store.setItem('joblist.searches.v1:pwork', JSON.stringify([search('later')]));
		mergeProfiles(store);
		expect(store.getItem('joblist.searches.v1')).not.toContain('later');
	});
	it('keeps a profile store into an empty space as it was', () => {
		const store = memory({ 'joblist.searches.v1:pwork': JSON.stringify([search('svelte')]) });
		mergeProfiles(store);
		expect(JSON.parse(/** @type {string} */ (store.getItem('joblist.searches.v1')))[0].query).toBe('svelte');
	});
});
