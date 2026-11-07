import { describe, expect, it } from 'vitest';
import { addressOf, readAddress, signingIn } from './address.js';

describe('address', () => {
	it('reads the state after the #, over an older query', () => {
		const params = readAddress(['q', 'where', 'view'], { search: '?q=old&where=Paris&page=2', hash: '#q=design&view=grid' });
		expect(Object.fromEntries(params)).toEqual({ q: 'design', where: 'Paris', view: 'grid' });
	});
	it('leaves a sign-in answer alone', () => {
		expect(signingIn('#state=abc&code=xyz&iss=x')).toBe(true);
		expect(signingIn('#q=state')).toBe(false);
		expect(Object.fromEntries(readAddress(['q'], { search: '', hash: '#state=a&code=b&q=x' }))).toEqual({});
	});
	it('writes it after the #, its keys out of the query, others kept', () => {
		expect(addressOf({ q: ' design ', where: '', pay: true, view: 'map', remote: null }, '/?q=old&page=2')).toBe('/?page=2#q=design&pay=1&view=map');
		expect(addressOf({ q: '' }, '/companies?q=x')).toBe('/companies');
	});
});
