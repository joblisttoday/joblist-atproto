import { describe, expect, it } from 'vitest';
import { badgeOf, glanceOf } from './glance.js';

const counts = { offers: { 'acme.org': 12, 'big.com': 1500 }, known: ['acme.org', 'quiet.org', 'big.com'] };

describe('glanceOf and badgeOf', () => {
	it('shows open jobs of an organization joblist knows, from its site or a subdomain', () => {
		expect(glanceOf('https://www.acme.org/about', counts, [])).toEqual({ key: 'acme.org', jobs: 12, known: true, saved: false });
		expect(glanceOf('https://careers.acme.org/', counts, [])?.key).toBe('acme.org');
		expect(badgeOf(glanceOf('https://acme.org', counts, []))).toEqual({ text: '12', color: '#1a7f37' });
		expect(badgeOf(glanceOf('https://big.com', counts, [])).text).toBe('999+');
	});
	it('marks one it knows that is not hiring, and one only kept', () => {
		expect(badgeOf(glanceOf('https://quiet.org/', counts, []))).toEqual({ text: '✓', color: '#1a7f37' });
		const kept = [{ url: 'https://coop.example' }, { url: 'https://www.instagram.com/some.coop/' }];
		expect(badgeOf(glanceOf('https://coop.example/team', counts, kept)).text).toBe('★');
		expect(badgeOf(glanceOf('https://www.instagram.com/some.coop/', counts, kept)).text).toBe('★');
		expect(badgeOf(glanceOf('https://www.instagram.com/other/', counts, kept)).text).toBe('');
	});
	it('says nothing of other sites, or pages not on the web', () => {
		expect(badgeOf(glanceOf('https://elsewhere.net', counts, [])).text).toBe('');
		expect(glanceOf('about:addons', counts, [])).toBeNull();
	});
});
