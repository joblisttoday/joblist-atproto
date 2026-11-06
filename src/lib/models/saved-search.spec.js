import { describe, expect, it } from 'vitest';
import { allNewCount, fromParams, isEmpty, nearby, newCount, sameSearch, toParams } from './saved-search.js';

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
		// Across searches, a job new in two of them counts once.
		const wider = { query: 'frontend', where: '', remote: /** @type {''} */ (''), seen: '2026-10-15' };
		expect(allNewCount([{ ...search, seen: '2026-10-15' }, wider], jobs, new Map())).toBe(1);
	});
});

describe('searches near someone', () => {
	const base = { query: 'designer', where: '', remote: /** @type {''} */ ('') };
	it('are the same from about the same place, within the same time', () => {
		expect(sameSearch({ ...base, near: [13.40512, 52.52003], within: 30 }, { ...base, near: [13.4052, 52.5201], within: 30 })).toBe(true);
		expect(sameSearch({ ...base, near: [13.405, 52.52], within: 30 }, { ...base, near: [13.405, 52.52], within: 15 })).toBe(false);
		expect(sameSearch({ ...base, near: [13.405, 52.52], within: 30 }, base)).toBe(false);
	});
	it('keep the place to about 100 m', () => {
		expect(nearby([13.40512, 52.52049])).toEqual([13.405, 52.52]);
		expect(nearby(null)).toBe(null);
	});
});
