import { describe, expect, it } from 'vitest';
import config from '#lib/data/config.json';
import { toCompany, toForm } from './company.js';
import {
	addTags,
	afterDelete,
	companyRecord,
	draftApplies,
	missingFields,
	popularTags,
	previewCompany,
	readBoardInput,
	readLink,
	readWebsite,
	saveOutcome,
	splitTags,
	tagWord
} from './company-form.js';

/** @param {string} did @param {string} date @param {Record<string, any>} [value] */
const version = (did, date, value = {}) => ({
	did,
	rkey: 'acme.org',
	uri: `at://${did}/today.joblist.company/acme.org`,
	cid: '',
	value: { name: 'Acme', createdAt: date, ...value }
});
/** @param {any[]} versions @param {Map<string, {handle: string}>} [profiles] */
const company = (versions, profiles = new Map()) => toCompany(versions, profiles);

describe('tags', () => {
	it('are lowercase words without #', () => {
		expect(tagWord('  #Open   Source ')).toBe('open source');
		expect(tagWord('x'.repeat(100))).toHaveLength(config.companyForm.tagMax);
	});
	it('are finished by a comma or a new line', () => {
		expect(splitTags('Food, coop,cli')).toEqual({ done: ['food', 'coop'], rest: 'cli' });
		expect(splitTags('food')).toEqual({ done: [], rest: 'food' });
		expect(splitTags('a,,b\n')).toEqual({ done: ['a', 'b'], rest: '' });
	});
	it('are added once each, up to the most a record holds', () => {
		expect(addTags(['food'], ['Food', 'coop', ''])).toEqual(['food', 'coop']);
		const full = Array.from({ length: config.companyForm.tagsMax }, (_, i) => `t${i}`);
		expect(addTags(full, ['more'])).toEqual(full);
	});
	it('are suggested from other companies, most used first, matching what is typed', () => {
		const companies = [
			company([version('did:a', '2026-01-01', { tags: ['climate', 'coop'] })]),
			company([version('did:b', '2026-01-01', { tags: ['climate', 'design'] })]),
			company([version('did:c', '2026-01-01', { tags: ['climate', 'coop', 'cloud'] })])
		];
		expect(popularTags(companies, [], '', 2).map((s) => s.tag)).toEqual(['climate', 'coop']);
		expect(popularTags(companies, ['climate'], 'c', 5).map((s) => s.tag)).toEqual(['coop', 'cloud']);
		expect(popularTags(companies, [], 'sign', 5)).toEqual([{ tag: 'design', count: 1 }]);
	});
});

describe('readLink', () => {
	it('says where a link goes, or that it is not one', () => {
		expect(readLink('')).toEqual({ state: 'empty' });
		expect(readLink('www.linkedin.com/company/acme')).toEqual({ state: 'ok', url: 'https://www.linkedin.com/company/acme', host: 'linkedin.com' });
		expect(readLink('acme')).toEqual({ state: 'invalid' });
		expect(readLink('javascript:alert(1)')).toEqual({ state: 'invalid' });
	});
});

describe('readWebsite', () => {
	const known = new Map([['acme.org', company([version('did:a', '2026-01-01')])]]);
	it('names the page a new company will have', () => {
		expect(readWebsite('https://www.Beta.org/about', known)).toEqual({ state: 'new', key: 'beta.org' });
		expect(readWebsite('', known)).toEqual({ state: 'empty', key: '' });
		expect(readWebsite('not a site', known)).toEqual({ state: 'invalid', key: '' });
		expect(readWebsite('localhost', known)).toEqual({ state: 'invalid', key: '' });
	});
	it('says when the company is already on joblist', () => {
		expect(readWebsite('acme.org', known)).toEqual({ state: 'exists', key: 'acme.org' });
	});
	it('keeps the key of a company being edited', () => {
		expect(readWebsite('https://other.org', known, 'acme.org')).toEqual({ state: 'kept', key: 'acme.org' });
	});
});

describe('readBoardInput', () => {
	it('reads a job board link pasted whole', () => {
		expect(readBoardInput('https://jobs.lever.co/acme/123')).toEqual({ provider: 'lever', id: 'acme' });
		expect(readBoardInput('acme.recruitee.com')).toEqual({ provider: 'recruitee', id: 'acme' });
	});
	it('leaves a plain id or another site alone', () => {
		expect(readBoardInput('acme')).toBeNull();
		expect(readBoardInput('https://acme.org/jobs')).toBeNull();
	});
});

describe('missingFields', () => {
	it('lists what a page lacks, in order', () => {
		expect(missingFields(company([version('did:a', '2026-01-01')]))).toEqual(['description', 'jobBoard', 'locations', 'tags']);
		const full = version('did:a', '2026-01-01', { description: 'x', jobBoard: { url: 'https://acme.org/jobs' }, locations: [{ name: 'Lyon' }], tags: ['coop'] });
		expect(missingFields(company([full]))).toEqual([]);
	});
});

describe('previewCompany', () => {
	it('shows the company as it will be saved', () => {
		const form = { ...toForm(null), name: ' Acme ', tags: ['coop'], careersUrl: 'https://jobs.lever.co/acme' };
		const preview = previewCompany(form, 'acme.org');
		expect(preview).toMatchObject({ key: 'acme.org', name: 'Acme', tags: ['coop'], jobBoard: { provider: 'lever', id: 'acme' } });
	});
	it('waits for a name and a website', () => {
		expect(previewCompany({ ...toForm(null), name: 'Acme' }, '')).toBeNull();
		expect(previewCompany(toForm(null), 'acme.org')).toBeNull();
	});
});

describe('companyRecord', () => {
	it('keys a new company by its website', () => {
		const form = { ...toForm(null), name: 'Acme', url: 'https://www.acme.org/', careersUrl: 'https://jobs.ashbyhq.com/acme' };
		const { key, record } = companyRecord(form, null, 'did:me', '2026-05-01');
		expect(key).toBe('acme.org');
		expect(record).toMatchObject({ $type: 'today.joblist.company', createdAt: '2026-05-01', updatedAt: '2026-05-01', jobBoard: { provider: 'ashby', id: 'acme' } });
		expect(record.jobBoard).not.toHaveProperty('url');
	});
	it('keeps the key and the first description date of the person editing', () => {
		const edited = company([version('did:me', '2026-01-01'), version('did:other', '2026-02-01')]);
		const form = { ...toForm(edited), url: 'https://elsewhere.org' };
		const { key, record } = companyRecord(form, edited, 'did:me', '2026-05-01');
		expect(key).toBe('acme.org');
		expect(record).toMatchObject({ createdAt: '2026-01-01', updatedAt: '2026-05-01' });
		expect(companyRecord(form, edited, 'did:new', '2026-05-01').record.createdAt).toBe('2026-05-01');
	});
	it('starts from the version shown', () => {
		const edited = company([version('did:a', '2026-01-01', { description: 'old' }), version('did:b', '2026-02-01', { description: 'new' })]);
		expect(companyRecord(toForm(edited), edited, 'did:me').record.description).toBe('new');
	});
});

describe('saveOutcome', () => {
	const profiles = new Map([['did:org', { handle: 'acme.org' }]]);
	it('is shown, unless the company has its own version', () => {
		expect(saveOutcome(null, 'me.bsky.social')).toBe('shown');
		expect(saveOutcome(company([version('did:a', '2026-01-01')]), 'me.bsky.social')).toBe('shown');
		expect(saveOutcome(company([version('did:org', '2026-01-01')], profiles), 'me.bsky.social')).toBe('behindOwn');
	});
	it('is the company own version when saved from its domain', () => {
		expect(saveOutcome(company([version('did:a', '2026-01-01')]), 'acme.org')).toBe('own');
	});
});

describe('afterDelete', () => {
	const profiles = new Map();
	it('removes the company when it was the only version', () => {
		expect(afterDelete(company([version('did:me', '2026-01-01')]), 'did:me', profiles)).toEqual({ outcome: 'gone' });
	});
	it('shows the next most recent version when the deleted one was shown', () => {
		const c = company([version('did:me', '2026-03-01'), version('did:a', '2026-01-01'), version('did:b', '2026-02-01')]);
		const result = afterDelete(c, 'did:me', profiles);
		expect(result.outcome).toBe('replaced');
		expect('next' in result && result.next.did).toBe('did:b');
	});
	it('changes nothing shown when another version was shown', () => {
		const c = company([version('did:me', '2026-01-01'), version('did:a', '2026-02-01')]);
		expect(afterDelete(c, 'did:me', profiles).outcome).toBe('unchanged');
	});
});

describe('draftApplies', () => {
	const draft = { ...toForm(null), name: 'Acme', url: 'https://acme.org', provider: 'lever', boardId: 'acme' };
	it('applies to the same company, or when nothing was pasted', () => {
		expect(draftApplies(draft, {})).toBe(true);
		expect(draftApplies(draft, { url: 'https://www.acme.org/jobs' })).toBe(true);
		expect(draftApplies(draft, { url: 'https://beta.org' })).toBe(false);
	});
	it('applies to the same job board pasted', () => {
		expect(draftApplies(draft, { provider: 'lever', boardId: 'Acme' })).toBe(true);
		expect(draftApplies(draft, { provider: 'ashby', boardId: 'linear' })).toBe(false);
	});
	it('needs something written', () => {
		expect(draftApplies(toForm(null), {})).toBe(false);
	});
});
