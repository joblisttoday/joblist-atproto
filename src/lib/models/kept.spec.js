import { describe, expect, it } from 'vitest';
import { applyChanges, cleanTags, isDomain, listsToKept, mergeKept, organizationPage, keptTags, keptUrl, keyOf, knownBy, readKept, withKept, withTags } from './kept.js';

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

describe('tags', () => {
	it('are lowercase words, each once', () => {
		expect(cleanTags([' Design ', '#coop', 'design', 'Open Source', 3, ''])).toEqual(['design', 'coop', 'open-source']);
		const list = readKept([{ url: 'acme.org', tags: ['Coop'] }, { url: 'beta.io', tags: ['coop', 'design'] }]);
		expect(list[0].tags).toEqual(['coop']);
		expect(keptTags(list)).toEqual(['coop', 'design']);
		expect(withTags(list, 'https://acme.org', [])[0]).toEqual({ url: 'https://acme.org', name: '', at: '' });
	});
});

describe('applyChanges', () => {
	it('makes the add-on changes in order, leaving out what is not one', () => {
		const list = readKept([{ url: 'acme.org', name: 'Acme' }]);
		const next = applyChanges(list, [
			{ op: 'keep', url: 'beta.io', name: 'Beta', tags: ['Design'], at: 't1' },
			{ op: 'tags', url: 'https://acme.org', tags: ['coop'], at: 't2' },
			{ op: 'forget', url: 'https://beta.io', at: 't3' },
			{ op: 'keep', url: 'nope', at: 't4' },
			{ op: 'what', url: 'https://acme.org' }
		]);
		expect(next).toEqual([{ url: 'https://acme.org', name: 'Acme', at: '', tags: ['coop'] }]);
		expect(applyChanges(list, 'nonsense')).toBe(list);
	});
});

describe('listsToKept', () => {
	it('keeps the organizations of private lists, tagged with their names; the saved ones untagged', () => {
		const lists = [
			{ rkey: 'lother', value: { name: 'Coops', companies: ['x.org', 'acme.org'], createdAt: 'u' } },
			{ rkey: 'lsaved', value: { name: 'Saved organizations', companies: ['acme.org', 'acme.org'], createdAt: 't' } }
		];
		expect(listsToKept(lists)).toEqual([
			{ url: 'https://x.org', name: '', at: 'u', tags: ['coops'] },
			{ url: 'https://acme.org', name: '', at: 'u', tags: ['coops'] }
		]);
		expect(listsToKept(null)).toEqual([]);
	});
});

describe('mergeKept', () => {
	it('keeps each link once, its first name, both tags, at most max', () => {
		const a = [{ url: 'https://a.org', name: 'A', at: '1', tags: ['x'] }];
		const b = [
			{ url: 'https://a.org', name: 'Other', at: '2', tags: ['y'] },
			{ url: 'https://b.org', name: '', at: '2' }
		];
		expect(mergeKept(a, b, 10)).toEqual([{ url: 'https://a.org', name: 'A', at: '1', tags: ['x', 'y'] }, b[1]]);
		expect(mergeKept(a, b, 1)).toHaveLength(1);
	});
});

describe('organizationPage', () => {
	const companies = new Map([['gitlab.com', { key: 'gitlab.com', name: 'GitLab', jobBoard: { provider: 'greenhouse', id: 'gitlab' } }]]);
	const known = knownBy(companies);
	it('opens joblist page of one it knows, by its domain or its board', () => {
		expect(organizationPage('gitlab.com', known)).toEqual({ href: '/gitlab.com', name: 'GitLab', known: true, sure: true });
		expect(organizationPage('https://boards.greenhouse.io/gitlab', known)?.href).toBe('/gitlab.com');
	});
	it("else its domain's page, else the link's", () => {
		expect(organizationPage('www.acme.coop', known)).toEqual({ href: '/acme.coop', name: 'acme.coop', known: false, sure: true });
		expect(organizationPage('instagram.com/some.coop', known)?.href).toBe('/explore/organization#url=https%3A%2F%2Finstagram.com%2Fsome.coop');
	});
	it('words are no link', () => {
		expect(organizationPage('product designer', known)).toBeNull();
		expect(organizationPage('design', known)).toBeNull();
	});
});

describe('isDomain', () => {
	it('knows a domain by a top-level domain that exists', () => {
		for (const host of ['gitlab.com', 'joblist.today', 'some.bsky.social', 'acme.coop', 'xn--bcher-kva.de']) expect(isDomain(host)).toBe(true);
		for (const host of ['test.env', 'llm.txt', 'fake-fomaine.no-tld', 'node.js', 'localhost', 'a..com', '-a.com', 'camunda']) expect(isDomain(host)).toBe(false);
	});
	it('offers no organization for a name that is no domain', () => {
		expect(organizationPage('test.env', () => undefined)).toBeNull();
		expect(organizationPage('node.js', () => undefined)).toBeNull();
	});
});
