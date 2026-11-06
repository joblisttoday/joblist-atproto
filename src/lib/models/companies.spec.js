import { describe, expect, it } from 'vitest';
import { Companies, twins } from './companies.js';

const company = (/** @type {string} */ key, /** @type {string} */ id, verified = false) =>
	/** @type {any} */ ({ key, name: key, verified, jobBoard: { provider: 'greenhouse', id } });

describe('twins', () => {
	it('finds companies sharing a job board, keeping the one named by its domain', () => {
		expect([...twins([company('scale-ai', 'scaleai'), company('scale.com', 'ScaleAI'), company('acme.org', 'acme')])]).toEqual([
			['scale-ai', 'scale.com']
		]);
	});
	it('never merges a verified company: a job board alone does not take a page', () => {
		// aaa-stripe.com sorts first, names Stripe's board and verified its own domain: both pages stay.
		expect([...twins([company('stripe.com', 'stripe'), company('aaa-stripe.com', 'stripe', true)])]).toEqual([]);
		expect([...twins([company('stripe.com', 'stripe', true), company('aaa-stripe.com', 'stripe')])]).toEqual([]);
		// Unverified, aaa-stripe.com would still be dropped for… whichever sorts first: both named by a domain.
		expect([...twins([company('stripe.com', 'stripe'), company('stripe-jobs', 'stripe')])]).toEqual([['stripe-jobs', 'stripe.com']]);
	});
});

describe('Companies', () => {
	const companies = new Companies([company('scale-ai', 'scaleai'), company('scale.com', 'scaleai'), company('acme.org', 'acme')]);
	it('lists each company once', () => {
		expect([...companies.keys()]).toEqual(['scale.com', 'acme.org']);
		expect(companies.size).toBe(2);
	});
	it('gives the kept company for a twin key', () => {
		expect(companies.get('scale-ai')?.key).toBe('scale.com');
		expect(companies.has('scale-ai')).toBe(true);
		expect(companies.get('nope')).toBe(undefined);
	});
});
