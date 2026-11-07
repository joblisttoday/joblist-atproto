import { describe, expect, it } from 'vitest';
import { change, payCurrencies, readStats, share, weekly } from './stats.js';

describe('stats', () => {
	it('reads the file, checked', () => {
		expect(readStats(null)).toBe(null);
		expect(readStats({ weeks: 'x', now: {} })).toBe(null);
		const stats = readStats({
			since: '2026-11-06T21:00Z',
			weeks: [{ week: '2026-11-02', new: 5, closed: -1, open: 'x', partial: true, fields: { design: 2, bad: 'x' }, cities: null }, { week: 'nope' }],
			now: { open: 9, newWeekBefore: null, daysOpen: 4, fields: [{ slug: 'design', open: 3, pay: { USD: 100000 } }, {}], cities: [{ slug: 'berlin', open: 2 }] }
		});
		expect(stats?.weeks).toEqual([{ week: '2026-11-02', new: 5, closed: 0, open: 0, partial: true, fields: { design: 2, bad: 0 }, cities: {} }]);
		expect(stats?.now.newWeekBefore).toBe(null);
		expect(stats?.now.fields).toEqual([{ slug: 'design', open: 3, daysOpen: 0, pay: { USD: 100000 } }]);
		expect(stats?.now.cities).toEqual([{ slug: 'berlin', name: 'berlin', open: 2 }]);
	});
	it('says changes and shares in percent', () => {
		expect(change(120, 100)).toBe(20);
		expect(change(80, 100)).toBe(-20);
		expect(change(5, null)).toBe(null);
		expect(change(5, 0)).toBe(null);
		expect(share(1, 3)).toBe(33);
		expect(share(1, 0)).toBe(0);
	});
	it('the pay table: the most common currencies', () => {
		expect(payCurrencies([{ pay: { USD: 1, EUR: 1 } }, { pay: { USD: 1, GBP: 1 } }, { pay: { USD: 1 } }], 2)).toEqual(['USD', 'EUR']);
	});
	it('a field, week by week', () => {
		expect(weekly([{ week: 'a', new: 0, closed: 0, open: 0, fields: { design: 2 }, cities: {} }, { week: 'b', new: 0, closed: 0, open: 0, fields: {}, cities: {} }], 'fields', 'design')).toEqual([2, 0]);
	});
});
