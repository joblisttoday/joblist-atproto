import { describe, expect, it } from 'vitest';
import { fromParams, isEmpty, newCount, sameSearch, toParams } from './saved-search.js';

/** @type {import('./job.js').JobFilters} */
const search = { query: 'frontend', where: 'Berlin', remote: 'remote' };

describe('search addresses', () => {
	it('round-trips, without empty filters', () => {
		expect(toParams(search)).toBe('?q=frontend&where=Berlin&remote=remote');
		expect(fromParams(new URLSearchParams('q=frontend&where=Berlin&remote=remote'))).toEqual(search);
		expect(toParams({ query: ' ', where: '', remote: '' })).toBe('');
		expect(isEmpty({ query: '', where: '', remote: '' })).toBe(true);
	});
	it('ignores an unknown remote value', () => {
		expect(fromParams(new URLSearchParams('remote=yes')).remote).toBe('');
	});
	it('compares searches whatever the case and spaces', () => {
		expect(sameSearch(search, { query: ' Frontend ', where: 'berlin', remote: 'remote' })).toBe(true);
		expect(sameSearch(search, { ...search, remote: '' })).toBe(false);
	});
});

describe('newCount', () => {
	it('counts matching jobs published since last seen', () => {
		const job = { title: 'Frontend developer', company: 'a', location: 'Berlin', remote: 'remote' };
		const jobs = [
			{ ...job, url: '1', published: '2026-10-19' },
			{ ...job, url: '2', published: '2026-10-10' },
			{ ...job, url: '3' },
			{ ...job, url: '4', title: 'Designer', published: '2026-10-19' }
		];
		expect(newCount({ ...search, seen: '2026-10-15' }, jobs, new Map())).toBe(1);
	});
});
