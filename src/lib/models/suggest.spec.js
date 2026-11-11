import { describe, expect, it } from 'vitest';
import { suggestAddress } from './suggest.js';

describe('suggestAddress', () => {
	it('fills the add form with what was found, each link once', () => {
		const address = new URL(
			suggestAddress({ link: 'https://instagram.com/acme', website: 'https://acme.org', name: 'Acme', board: 'https://jobs.lever.co/acme', description: 'A coop', others: ['https://bsky.app/profile/acme.org', 'https://acme.org'] }),
			'https://joblist.example'
		);
		expect(address.pathname).toBe('/add');
		expect(Object.fromEntries([...address.searchParams].filter(([k]) => k !== 'link'))).toEqual({ url: 'https://acme.org', name: 'Acme', board: 'https://jobs.lever.co/acme', description: 'A coop' });
		expect(address.searchParams.getAll('link')).toEqual(['https://bsky.app/profile/acme.org', 'https://instagram.com/acme']);
	});
});
