import { describe, expect, it } from 'vitest';
import { oneRange, packSalary, toPeriod, toSalary, unpackSalary } from './salary.js';

describe('toSalary', () => {
	it('reads numbers and numeric text, in order', () => {
		expect(toSalary({ min: '84300', max: '94000', currency: 'usd', period: 'year' })).toEqual({ min: 84300, max: 94000, currency: 'USD', period: 'year' });
		expect(toSalary({ min: 90, max: 60, currency: 'EUR', period: 'hour' })).toEqual({ min: 60, max: 90, currency: 'EUR', period: 'hour' });
		expect(toSalary({ max: 5000, currency: 'EUR', period: 'month' })).toEqual({ max: 5000, currency: 'EUR', period: 'month' });
	});
	it('says nothing without an amount, a currency or a period', () => {
		expect(toSalary({ min: null, max: null, currency: null, period: null })).toBeUndefined();
		expect(toSalary({ min: 1, max: 2, currency: 'dollars', period: 'year' })).toBeUndefined();
		expect(toSalary({ min: 1, max: 2, currency: 'USD', period: 'fortnight' })).toBeUndefined();
	});
});

describe('oneRange', () => {
	it('spans the ranges of the first currency and period', () => {
		const ranges = [
			toSalary({ min: 60, max: 60, currency: 'USD', period: 'hour' }),
			toSalary({ min: 70, max: 75, currency: 'USD', period: 'hour' }),
			toSalary({ min: 50000, max: 60000, currency: 'GBP', period: 'year' })
		];
		expect(oneRange(ranges)).toEqual({ min: 60, max: 75, currency: 'USD', period: 'hour' });
		expect(oneRange([toSalary({ min: 60, max: 60, currency: 'USD', period: 'hour' })])).toEqual({ min: 60, currency: 'USD', period: 'hour' });
		expect(oneRange([undefined])).toBeUndefined();
	});
});

describe('toPeriod', () => {
	it('reads the intervals of Ashby, Lever and others', () => {
		expect(toPeriod('1 YEAR')).toBe('year');
		expect(toPeriod('per-hour-wage')).toBe('hour');
		expect(toPeriod('per-month-salary')).toBe('month');
		expect(toPeriod('bi-week-salary')).toBeUndefined();
		expect(toPeriod('NONE')).toBeUndefined();
	});
});

describe('packSalary', () => {
	it('keeps a salary compact and reads it back', () => {
		const salary = { min: 158300, max: 237500, currency: 'USD', period: /** @type {const} */ ('year') };
		expect(packSalary(salary)).toEqual([158300, 237500, 'USD', 'year']);
		expect(unpackSalary(packSalary(salary))).toEqual(salary);
		expect(unpackSalary([0, 5000, 'EUR', 'month'])).toEqual({ max: 5000, currency: 'EUR', period: 'month' });
		expect(unpackSalary('nope')).toBeUndefined();
	});
});
