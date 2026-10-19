import { describe, expect, it } from 'vitest';
import { detectBoard, findBoards, isProviderUrl } from './detect.js';

describe('detectBoard', () => {
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
