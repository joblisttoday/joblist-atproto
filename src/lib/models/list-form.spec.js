import { describe, expect, it } from 'vitest';
import { findCompanies, listDraftApplies, moveItem, previewList, readPasted, resumeDraft, toListForm } from './list-form.js';

/** @param {string} key @param {string} name @param {Record<string, any>} [more] */
const company = (key, name, more = {}) =>
	/** @type {import('./company.js').Company} */ (/** @type {unknown} */ ({ key, name, tags: [], locations: [], ...more }));

describe('toListForm', () => {
	it('starts a new list open to all, from what the page gives', () => {
		expect(toListForm(null, { companies: ['a.org'] })).toEqual({
			name: '',
			description: '',
			companies: ['a.org'],
			copiedFrom: '',
			open: true,
			hidden: []
		});
	});

	it('starts an edit from the list as it is, without sharing its arrays', () => {
		const list = { uri: 'u', did: 'd', rkey: 'r', name: 'L', companies: ['a.org'], open: false, hidden: ['x.org'], createdAt: '' };
		const form = toListForm(list);
		expect(form).toMatchObject({ name: 'L', open: false, companies: ['a.org'], hidden: ['x.org'] });
		form.companies.push('b.org');
		expect(list.companies).toEqual(['a.org']);
	});
});

describe('listDraftApplies', () => {
	const draft = { ...toListForm(null), name: 'Co-ops' };

	it('applies a draft with something written', () => {
		expect(listDraftApplies(draft, {})).toBe(true);
		expect(listDraftApplies(toListForm(null), {})).toBe(false);
		expect(listDraftApplies(null, {})).toBe(false);
	});

	it('applies to a copy only when it is the copy of the same list', () => {
		expect(listDraftApplies({ ...draft, copiedFrom: 'at://a' }, { copiedFrom: 'at://a' })).toBe(true);
		expect(listDraftApplies(draft, { copiedFrom: 'at://a' })).toBe(false);
	});
});

describe('resumeDraft', () => {
	it('adds the company the page starts with, once', () => {
		const draft = { ...toListForm(null), companies: ['a.org'] };
		expect(resumeDraft(draft, { companies: ['b.org'] }).companies).toEqual(['a.org', 'b.org']);
		expect(resumeDraft(draft, { companies: ['a.org'] }).companies).toEqual(['a.org']);
	});
});

describe('previewList', () => {
	it('shows nothing before the list has a name', () => {
		expect(previewList(toListForm(null), '')).toBeNull();
	});

	it('shows the list trimmed, its companies once', () => {
		const form = { ...toListForm(null), name: ' Co-ops ', description: ' ', companies: ['a.org', 'a.org'] };
		expect(previewList(form, 'did:me')).toMatchObject({ name: 'Co-ops', description: undefined, companies: ['a.org'], did: 'did:me' });
	});
});

describe('findCompanies', () => {
	const companies = [
		company('acme.org', 'Acme', { tags: ['coop'] }),
		company('zcoop.org', 'Zed', { tags: ['coop'] }),
		company('coopa.org', 'Coopa'),
		company('other.org', 'Other')
	];
	const jobs = new Map([['zcoop.org', 5]]);

	it('offers the companies hiring most before something is typed', () => {
		expect(findCompanies(companies, [], ' ', jobs, 8).map((c) => c.key)).toEqual(['zcoop.org']);
		expect(findCompanies(companies, ['zcoop.org'], '', jobs, 8)).toEqual([]);
	});

	it('ranks names starting with the words first, then by open jobs', () => {
		expect(findCompanies(companies, [], 'coop', jobs, 8).map((c) => c.key)).toEqual(['coopa.org', 'zcoop.org', 'acme.org']);
	});

	it('leaves out the companies already in the list, and keeps to the limit', () => {
		expect(findCompanies(companies, ['coopa.org'], 'coop', jobs, 1).map((c) => c.key)).toEqual(['zcoop.org']);
	});
});

describe('moveItem', () => {
	it('moves an item, and stays in bounds', () => {
		expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
		expect(moveItem(['a', 'b', 'c'], 2, 3)).toEqual(['a', 'b', 'c']);
	});
});

describe('readPasted', () => {
	const company = (/** @type {string} */ key, /** @type {object} */ more = {}) => /** @type {any} */ ({ key, name: key, ...more });
	const companies = new Map([
		['acme.org', company('acme.org')],
		['coop.example', company('coop.example', { jobBoard: { provider: 'greenhouse', id: 'coopjobs' } })],
		['in.example', company('in.example')]
	]);

	it('finds the organizations pasted, by website, link or job board, each once', () => {
		const text = 'https://www.acme.org/about\nacme.org, https://boards.greenhouse.io/coopjobs\nnew.example  in.example';
		const pasted = readPasted(text, companies, ['in.example']);
		expect(pasted.found.map((c) => c.key)).toEqual(['acme.org', 'coop.example']);
		expect(pasted.missing).toEqual([{ key: 'new.example', link: 'https://new.example' }]);
		expect(pasted.already).toBe(1);
	});

	it('reads words without a dot as nothing', () => {
		expect(readPasted('Berlin startups', companies, [])).toEqual({ found: [], missing: [], already: 0 });
	});
});
