import { describe, expect, it } from 'vitest';
import { payAmount } from './salary.js';

describe('payAmount', () => {
	it('shortens big amounts and keeps small ones', () => {
		expect(payAmount({ min: 158300, max: 237500, currency: 'USD', period: 'year' }, 'en')).toBe('$158–238K');
		expect(payAmount({ min: 60, max: 75.5, currency: 'USD', period: 'hour' }, 'en')).toBe('$60 – $75.5');
		expect(payAmount({ max: 5000, currency: 'EUR', period: 'month' }, 'en')).toBe('€5,000');
		expect(payAmount({ min: 100000, max: 100000, currency: 'GBP', period: 'year' }, 'en')).toBe('£100K');
	});
	it('writes the amount in the reader language', () => {
		expect(payAmount({ min: 50000, max: 60000, currency: 'EUR', period: 'year' }, 'fr')).toMatch(/^50–60\sk\s€$/);
	});
});
