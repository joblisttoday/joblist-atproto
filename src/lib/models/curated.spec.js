import { describe, expect, it } from 'vitest';
import { candidatesOf, curatedLink } from './curated.js';

describe('a curated list', () => {
	it('from its Bluesky link', () => {
		expect(curatedLink('https://bsky.app/profile/alice.org/lists/3abc')).toEqual({ kind: 'list', handle: 'alice.org', rkey: '3abc' });
		expect(curatedLink('bsky.app/starter-pack/alice.org/3xyz')).toEqual({ kind: 'pack', handle: 'alice.org', rkey: '3xyz' });
		expect(curatedLink('https://bsky.app/profile/joblist.today/follows')).toEqual({ kind: 'follows', handle: 'joblist.today' });
		expect(curatedLink('at://did:plc:x/app.bsky.graph.list/3abc')).toEqual({ kind: 'list', handle: 'did:plc:x', rkey: '3abc' });
		expect(curatedLink('https://bsky.app/profile/alice.org')).toBeNull();
		expect(curatedLink('gitlab.com')).toBeNull();
	});
	it('its organizations: handles that are domains, those on joblist first, once each', () => {
		const members = [
			{ did: 'd1', handle: 'someone.bsky.social', name: 'Someone' },
			{ did: 'd2', handle: 'acme.org', name: 'Acme' },
			{ did: 'd3', handle: 'coop.example' },
			{ did: 'd2', handle: 'acme.org' },
			{ did: 'd4', handle: 'handle.invalid' }
		];
		expect(candidatesOf(members, new Set(['d3']))).toEqual([
			{ did: 'd3', url: 'https://coop.example', name: 'coop.example', avatar: undefined, onJoblist: true },
			{ did: 'd2', url: 'https://acme.org', name: 'Acme', avatar: undefined, onJoblist: false }
		]);
	});
});
