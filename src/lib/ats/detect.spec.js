import { describe, expect, it } from 'vitest';
import { detectBoard, findBoards, isProviderUrl } from './detect.js';

describe('detectBoard', () => {
	it('reads a board from its public API, which a careers page fetches its jobs from', () => {
		expect(detectBoard('https://boards-api.greenhouse.io/v1/boards/twilio/jobs?content=true')).toEqual({ provider: 'greenhouse', id: 'twilio' });
		expect(detectBoard('https://api.ashbyhq.com/posting-api/job-board/sentry?includeCompensation=true')).toEqual({ provider: 'ashby', id: 'sentry' });
		expect(detectBoard('https://api.lever.co/v0/postings/acme?mode=json')).toEqual({ provider: 'lever', id: 'acme' });
		expect(detectBoard('https://apply.workable.com/api/v3/accounts/acme/jobs')).toEqual({ provider: 'workable', id: 'acme' });
		expect(detectBoard('https://apply.workable.com/acme/')).toEqual({ provider: 'workable', id: 'acme' });
		expect(detectBoard('https://api.smartrecruiters.com/v1/companies/Acme/postings')).toEqual({ provider: 'smartrecruiters', id: 'Acme' });
		expect(detectBoard('https://api.rippling.com/platform/api/ats/v2/board/acme/jobs')).toEqual({ provider: 'rippling', id: 'acme' });
		expect(detectBoard('https://boards-api.greenhouse.io/v1/other')).toBeNull();
	});
	it('reads the id from the path or the subdomain', () => {
		expect(detectBoard('https://boards.greenhouse.io/acme/jobs/123')).toEqual({ provider: 'greenhouse', id: 'acme' });
		expect(detectBoard('https://job-boards.eu.greenhouse.io/acme')).toEqual({ provider: 'greenhouse', id: 'acme' });
		expect(detectBoard('https://boards.greenhouse.io/embed/job_board?for=acme')).toEqual({ provider: 'greenhouse', id: 'acme' });
		expect(detectBoard('https://jobs.lever.co/acme?team=x')).toEqual({ provider: 'lever', id: 'acme' });
		expect(detectBoard('https://acme.jobs.personio.com/job/1')).toEqual({ provider: 'personio', id: 'acme' });
		expect(detectBoard('//acme.recruitee.com/o/dev')).toEqual({ provider: 'recruitee', id: 'acme' });
		expect(detectBoard('https://ats.rippling.com/acme/jobs')).toEqual({ provider: 'rippling', id: 'acme' });
	});
	it('ignores other hosts and the providers own pages', () => {
		expect(detectBoard('https://acme.org/jobs')).toBeNull();
		expect(detectBoard('https://www.recruitee.com/pricing')).toBeNull();
		expect(detectBoard('https://boards.greenhouse.io/embed/job_board/js')).toBeNull();
		expect(detectBoard('not a url')).toBeNull();
	});
});

describe('findBoards', () => {
	it('lists linked boards, most linked first', () => {
		const html = `<a href="https://jobs.ashbyhq.com/acme">Jobs</a>
			<a href="https://jobs.lever.co/other">x</a><a href='https://jobs.ashbyhq.com/acme/123'>y</a>`;
		expect(findBoards(html)).toEqual([
			{ provider: 'ashby', id: 'acme', count: 2 },
			{ provider: 'lever', id: 'other', count: 1 }
		]);
	});
});

describe('isProviderUrl', () => {
	it('tells provider pages from company pages', () => {
		expect(isProviderUrl('https://jobs.lever.co/acme')).toBe(true);
		expect(isProviderUrl('https://acme.org/careers')).toBe(false);
	});
});
