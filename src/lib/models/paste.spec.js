import { describe, expect, it } from 'vitest';
import { findCompany, firstUrl, guessName, hasInput, parsePaste, prettyId, readExtras, readParams, toPrefill, withPrefill, boardFromCareers } from './paste.js';

/** @param {Record<string, string>} query */
const params = (query) => new URLSearchParams(query);

describe('firstUrl', () => {
	it('finds the first link in shared text', () => {
		expect(firstUrl('Senior dev at Acme https://jobs.lever.co/acme/123. Apply!')).toBe('https://jobs.lever.co/acme/123');
		expect(firstUrl('(see https://acme.org/jobs)')).toBe('https://acme.org/jobs');
		expect(firstUrl('acme.org')).toBe('https://acme.org');
		expect(firstUrl('acme.org/careers')).toBe('https://acme.org/careers');
	});
	it('ignores text without a link', () => {
		expect(firstUrl('Acme')).toBe('');
		expect(firstUrl('Acme Labs GmbH')).toBe('');
		expect(firstUrl(null)).toBe('');
	});
});

describe('readParams', () => {
	it('reads the share target, with the link in the text', () => {
		expect(readParams(params({ title: 'Jobs at Acme', text: 'Look https://acme.org/jobs' }))).toEqual({
			link: 'https://acme.org/jobs',
			name: '',
			board: ''
		});
	});
	it('prefers the url, and keeps the name and board from the bookmarklet', () => {
		expect(
			readParams(params({ url: 'https://acme.org/', name: 'Acme', board: 'https://jobs.lever.co/acme', text: 'x' }))
		).toEqual({ link: 'https://acme.org/', name: 'Acme', board: 'https://jobs.lever.co/acme' });
	});
	it('takes a typed name that is not a link as the name', () => {
		expect(readParams(params({ url: 'Acme Labs' }))).toEqual({ link: '', name: 'Acme Labs', board: '' });
	});
	it('knows when there is something to start from', () => {
		expect(hasInput(params({}))).toBe(false);
		expect(hasInput(params({ name: '' }))).toBe(true);
		expect(hasInput(params({ text: 'hi' }))).toBe(true);
	});
});

describe('names', () => {
	it('guesses a name from a domain', () => {
		expect(guessName('ableton.com')).toBe('Ableton');
		expect(guessName('acme-labs.co.uk')).toBe('Acme Labs');
		expect(guessName('careers.acme.org')).toBe('Acme');
		expect(guessName('blog.acme.io')).toBe('Acme');
	});
	it('prettifies a board id', () => {
		expect(prettyId('hugging-face')).toBe('Hugging Face');
		expect(prettyId('linear')).toBe('Linear');
	});
});

describe('parsePaste', () => {
	it('reads a job ad as a job board', () => {
		expect(parsePaste({ link: 'https://jobs.ashbyhq.com/linear/d3bc1ced', name: '', board: '' })).toEqual({
			url: '',
			key: '',
			name: 'Linear',
			board: { provider: 'ashby', id: 'linear' },
			careersUrl: '',
			guessed: true
		});
	});
	it('reads a website, keyed by its domain', () => {
		expect(parsePaste({ link: 'https://www.ableton.com/en/', name: '', board: '' })).toEqual({
			url: 'https://ableton.com',
			key: 'ableton.com',
			name: 'Ableton',
			board: null,
			careersUrl: '',
			guessed: true
		});
	});
	it('keeps a careers page, and the board found by the bookmarklet', () => {
		expect(parsePaste({ link: 'https://www.ableton.com/en/jobs/', name: 'Ableton', board: '' })).toMatchObject({
			key: 'ableton.com',
			name: 'Ableton',
			careersUrl: 'https://www.ableton.com/en/jobs/',
			guessed: false
		});
		expect(
			parsePaste({ link: 'https://careers.acme.org/', name: '', board: 'https://boards.greenhouse.io/acme' })
		).toMatchObject({ url: 'https://acme.org', key: 'acme.org', board: { provider: 'greenhouse', id: 'acme' }, careersUrl: '' });
	});
	it('starts from a name alone', () => {
		expect(parsePaste({ link: '', name: 'Acme', board: '' })).toMatchObject({ key: '', name: 'Acme', board: null });
	});
});

describe('findCompany', () => {
	const acme = /** @type {any} */ ({ key: 'acme.org', jobBoard: { provider: 'lever', id: 'Acme' } });
	const companies = new Map([['acme.org', acme]]);
	it('finds a company by domain or by job board', () => {
		expect(findCompany(companies, parsePaste({ link: 'https://www.acme.org', name: '', board: '' }))).toBe(acme);
		expect(findCompany(companies, parsePaste({ link: 'https://about.acme.org/team', name: '', board: '' }))).toBe(acme);
		expect(findCompany(companies, parsePaste({ link: 'https://blog.acme.org/', name: '', board: '' }))).toBe(acme);
		expect(findCompany(companies, parsePaste({ link: 'https://acme.org.uk/', name: '', board: '' }))).toBeNull();
		expect(findCompany(companies, parsePaste({ link: 'https://jobs.lever.co/acme/1', name: '', board: '' }))).toBe(acme);
		expect(findCompany(companies, parsePaste({ link: 'https://jobs.lever.co/other', name: '', board: '' }))).toBeNull();
	});
});

describe('toPrefill', () => {
	it('uses the name from the job board over a guessed one', () => {
		const pasted = parsePaste({ link: 'https://jobs.ashbyhq.com/hf', name: '', board: '' });
		expect(toPrefill(pasted, 'Hugging Face')).toEqual({
			url: '',
			name: 'Hugging Face',
			provider: 'ashby',
			boardId: 'hf',
			careersUrl: ''
		});
		const named = parsePaste({ link: 'https://jobs.ashbyhq.com/hf', name: 'HF', board: '' });
		expect(toPrefill(named, 'Hugging Face').name).toBe('HF');
	});
});

describe('withPrefill', () => {
	const empty = { url: '', name: '', provider: '', boardId: '', careersUrl: '', tags: '' };
	it('fills empty fields only', () => {
		const prefill = { url: 'https://acme.org', name: 'Acme', provider: 'lever', boardId: 'acme', careersUrl: '' };
		expect(withPrefill(empty, prefill)).toEqual({ ...empty, ...prefill });
		const existing = { ...empty, name: 'ACME Inc', careersUrl: 'https://acme.org/jobs' };
		expect(withPrefill(existing, prefill)).toEqual({ ...existing, url: 'https://acme.org' });
	});
});

describe('boardFromCareers', () => {
	it('turns a job board given as careers page into the job board', () => {
		const form = { provider: '', boardId: '', careersUrl: 'https://job-boards.greenhouse.io/acme/jobs/1' };
		expect(boardFromCareers(form)).toEqual({ provider: 'greenhouse', boardId: 'acme', careersUrl: '' });
		const own = { provider: '', boardId: '', careersUrl: 'https://acme.org/jobs' };
		expect(boardFromCareers(own)).toBe(own);
	});
});

describe('readExtras and withPrefill', () => {
	it('fills an empty description and links, never what is there', () => {
		const extras = readExtras(new URLSearchParams('description=+A+coop+&link=https://bsky.app/profile/acme.coop&link=nope'));
		expect(extras).toEqual({ description: 'A coop', links: ['https://bsky.app/profile/acme.coop'] });
		const empty = { url: '', name: '', provider: '', boardId: '', careersUrl: '', description: '', links: [] };
		expect(withPrefill(empty, extras)).toMatchObject(extras);
		const filled = { ...empty, description: 'Mine', links: ['https://acme.coop/blog'] };
		expect(withPrefill(filled, extras)).toMatchObject({ description: 'Mine', links: ['https://acme.coop/blog'] });
	});
});
