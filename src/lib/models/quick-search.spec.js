import { describe, expect, it } from 'vitest';
import { fold, matchRank, quickResults } from './quick-search.js';

const limits = { companies: 3, lists: 2, places: 3 };

describe('quick search', () => {
	it('matches names by their start or a word, ignoring case and accents', () => {
		expect(fold(' Zürich ')).toBe('zurich');
		expect(matchRank('Sentry', 'sen')).toBe(2);
		expect(matchRank('Deutsche Bahn', 'bahn')).toBe(1);
		expect(matchRank('Absentee', 'sen')).toBe(0);
	});
	it('offers companies, lists and places, the best first', () => {
		const sources = {
			companies: [
				{ key: 'berlinbank.de', name: 'Bank of Berlin' },
				{ key: 'berlin.io', name: 'Berlin Startup' },
				{ key: 'acme.org', name: 'Acme' }
			],
			lists: [{ uri: 'at://did:plc:a/today.joblist.list/1', did: 'did:plc:a', rkey: '1', name: 'Berlin', companies: ['acme.org'] }],
			places: /** @type {[string, number][]} */ ([
				['Berlin', 300],
				['Berlingen', 2],
				['Paris', 400]
			]),
			counts: new Map([['berlinbank.de', 50]])
		};
		const found = quickResults('berl', sources, limits);
		expect(found.companies.map((c) => c.key)).toEqual(['berlin.io', 'berlinbank.de']);
		expect(found.lists.map((l) => l.name)).toEqual(['Berlin']);
		expect(found.places).toEqual(['Berlin', 'Berlingen']);
		expect(quickResults('b', sources, limits).companies).toEqual([]);
	});
});
