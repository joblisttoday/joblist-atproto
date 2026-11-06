import { describe, expect, it } from 'vitest';
import { Companies, twins } from './companies.js';

const company = (/** @type {string} */ key, /** @type {string} */ id) =>
	/** @type {any} */ ({ key, name: key, jobBoard: { provider: 'greenhouse', id } });

describe('twins', () => {
	it('finds companies sharing a job board, keeping the one named by its domain', () => {
		expect([...twins([company('scale-ai', 'scaleai'), company('scale.com', 'ScaleAI'), company('acme.org', 'acme')])]).toEqual([
			['scale-ai', 'scale.com']
		]);
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
