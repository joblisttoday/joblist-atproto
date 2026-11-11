import { describe, expect, it } from 'vitest';
import { searchCompanies, searchJobs } from './webmcp-tools.js';

const origin = 'https://joblist.example';
const company = (/** @type {string} */ key, /** @type {string} */ name, /** @type {string[]} */ tags = []) =>
	/** @type {import('#lib/models/company.js').Company} */ (
		/** @type {unknown} */ ({ key, name, tags, links: [], locations: [{ name: 'Berlin', country: 'DE' }], url: `https://${key}` })
	);
const companies = new Map([
	['ableton.com', company('ableton.com', 'Ableton', ['music'])],
	['acme.org', company('acme.org', 'Acme', ['climate'])]
]);

describe('search_companies', () => {
	it('matches every word against name, domain, tags and places', () => {
		const result = searchCompanies(companies, { query: 'music berlin' }, origin);
		expect(result.total).toBe(1);
		expect(result.companies[0]).toMatchObject({ key: 'ableton.com', name: 'Ableton', page: `${origin}/ableton.com` });
	});
});

describe('search_jobs', () => {
	const jobs = [
		{ title: 'Frontend engineer', url: 'https://a/1', company: 'ableton.com', location: 'Berlin, Germany', published: '2026-10-01' },
		{ title: 'Frontend engineer', url: 'https://b/2', company: 'acme.org', location: 'Remote', published: '2026-10-02' },
		{ title: 'Accountant', url: 'https://b/3', company: 'acme.org', location: 'Paris' }
	];
	it('filters by words, place and remote, with company names', () => {
		expect(searchJobs(jobs, companies, { query: 'frontend' }).total).toBe(2);
		expect(searchJobs(jobs, companies, { query: 'frontend', place: 'berlin' }).jobs).toEqual([
			{ title: 'Frontend engineer', company: 'Ableton', location: 'Berlin, Germany', department: undefined, published: '2026-10-01', url: 'https://a/1' }
		]);
		expect(searchJobs(jobs, companies, { query: 'engineer', remote: true }).jobs[0].company).toBe('Acme');
	});
});
