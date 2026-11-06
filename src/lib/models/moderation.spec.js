import { describe, expect, it, vi } from 'vitest';

vi.mock('#lib/data/blocklist.json', () => ({ default: { accounts: ['did:plc:spam'], domains: ['scam.example'] } }));
const { allowed } = await import('./moderation.js');

describe('allowed', () => {
	it('leaves out blocked accounts and links to blocked domains', () => {
		expect(allowed({ did: 'did:plc:ok', value: { url: 'https://acme.org' } })).toBe(true);
		expect(allowed({ did: 'did:plc:spam', value: {} })).toBe(false);
		expect(allowed({ did: 'did:plc:ok', value: { apply: { url: 'https://jobs.scam.example/x' } } })).toBe(false);
		expect(allowed({ did: 'did:plc:ok', value: { company: 'scam.example' } })).toBe(false);
		expect(allowed({ did: 'did:plc:ok', value: { url: 'not a url ::' } })).toBe(true);
	});
});
