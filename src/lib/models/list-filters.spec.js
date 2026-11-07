import { describe, expect, it } from 'vitest';
import { findLists, listStats } from './list-filters.js';

/** @param {string} uri @param {string} name @param {Partial<import('./list.js').List>} [more] */
const list = (uri, name, more = {}) => /** @type {any} */ ({ uri, did: 'did:a', name, open: false, ...more });
const counts = new Map([
	['a.org', 40],
	['b.org', 3]
]);
const lists = [
	list('1', 'Berlin', { description: 'Companies in Berlin' }),
	list('2', 'Music', { open: true, did: 'did:b' }),
	list('3', 'Paris'),
	list('4', 'Atproto', { did: 'did:b' })
];
const stats = new Map([
	['1', listStats(['a.org', 'b.org', 'c.org'], counts)],
	['2', listStats(['b.org'], counts)],
	['3', listStats(['c.org', 'd.org', 'e.org'], counts)],
	['4', listStats(['c.org'], counts)]
]);
const none = { query: '', hiring: false, open: false, mine: false };
const people = { me: 'did:b', handleOf: (/** @type {string} */ did) => (did === 'did:b' ? 'bea.bsky.social' : 'ana.bsky.social') };
const uris = (/** @type {any[]} */ found) => found.map((l) => l.uri);

describe('listStats', () => {
	it('counts the companies, those hiring, and their open jobs', () => {
		expect(listStats(['a.org', 'b.org', 'c.org'], counts)).toEqual({ companies: 3, hiring: 2, jobs: 43 });
	});
});

describe('findLists', () => {
	it('puts the lists with the most open jobs first, then the biggest', () => {
		expect(uris(findLists(lists, none, stats, people))).toEqual(['1', '2', '3', '4']);
	});
	it('finds by words in the name, the description or the author', () => {
		expect(uris(findLists(lists, { ...none, query: 'companies berlin' }, stats, people))).toEqual(['1']);
		expect(uris(findLists(lists, { ...none, query: '@bea' }, stats, people))).toEqual(['2', '4']);
	});
	it('keeps only the lists hiring, open, or mine', () => {
		expect(uris(findLists(lists, { ...none, hiring: true }, stats, people))).toEqual(['1', '2']);
		expect(uris(findLists(lists, { ...none, open: true }, stats, people))).toEqual(['2']);
		expect(uris(findLists(lists, { ...none, mine: true }, stats, people))).toEqual(['2', '4']);
		expect(uris(findLists(lists, { ...none, mine: true }, stats, { ...people, me: null }))).toEqual([]);
	});
});
