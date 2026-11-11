import { describe, expect, it } from 'vitest';
import { keptUrl, keyOf, knownBy, readKept, withKept } from './kept.js';

describe('keptUrl', () => {
	it('reads a link, a bare domain too; a home is its domain', () => {
		expect(keptUrl('acme.org')).toBe('https://acme.org');
		expect(keptUrl(' https://www.acme.org/ ')).toBe('https://www.acme.org');
		expect(keptUrl('https://www.instagram.com/acme.studio/#top')).toBe('https://www.instagram.com/acme.studio/');
	});
	it('refuses what is not a web link', () => {
		for (const text of ['', 'acme', 'hello world.org', 'mailto:a@acme.org', 'javascript:alert(1)', 'ftp://acme.org']) expect(keptUrl(text)).toBeNull();
	});
});

describe('keyOf', () => {
	it("names an organization by its domain, not by a platform's page", () => {
		expect(keyOf('https://www.acme.org/about')).toBe('acme.org');
		expect(keyOf('https://www.facebook.com/groups/acme')).toBe('');
		expect(keyOf('https://gitlab.com')).toBe('gitlab.com');
		expect(keyOf('https://gitlab.com/acme')).toBe('');
		expect(keyOf('https://jobs.lever.co/acme')).toBe('');
	});
});

describe('knownBy', () => {
	const companies = new Map([
		['acme.org', { key: 'acme.org', name: 'Acme', jobBoard: { provider: 'lever', id: 'acme' } }],
		['beta.io', { key: 'beta.io', name: 'Beta' }],
		['gamma.org', { key: 'gamma.org', name: 'Gamma', jobBoard: { url: 'https://gamma.recruitee.com' } }]
	]);
	const known = knownBy(companies);
	it('finds an organization by its domain or its job board', () => {
		expect(known('https://acme.org/team')?.name).toBe('Acme');
		expect(known('https://jobs.lever.co/ACME/123')?.name).toBe('Acme');
		expect(known('https://www.beta.io')?.name).toBe('Beta');
		expect(known('https://gamma.recruitee.com/o/designer')?.name).toBe('Gamma');
		expect(known('https://instagram.com/acme')).toBeUndefined();
	});
});

describe('readKept and withKept', () => {
	it('keeps each checked link once, newest first, a name updated', () => {
		const list = readKept([{ url: 'acme.org', name: ' Acme ' }, { url: 'https://acme.org/' }, { url: 'nope' }, null]);
		expect(list).toEqual([{ url: 'https://acme.org', name: 'Acme', at: '' }]);
		const more = withKept(list, 'https://beta.io', 'Beta', 't');
		expect(more.map((k) => k.url)).toEqual(['https://beta.io', 'https://acme.org']);
		expect(withKept(more, 'https://acme.org', 'Acme Co', 't')[1].name).toBe('Acme Co');
		expect(withKept(more, 'https://acme.org', '', 't')[1].name).toBe('Acme');
	});
});
