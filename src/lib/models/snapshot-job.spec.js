import { describe, expect, it } from 'vitest';
import { fromSnapshot, readJobsFile } from './snapshot-job.js';
import { workplace } from './job.js';

describe('fromSnapshot', () => {
	it('reads a compact job', () => {
		expect(fromSnapshot({ t: 'Engineer', u: 'https://acme.org/jobs/12', c: 'acme.org', l: 'Berlin', p: '2026-11-02T17:49Z', r: 'hybrid', g: [13.4, 52.5] })).toEqual({
			title: 'Engineer',
			url: 'https://acme.org/jobs/12',
			company: 'acme.org',
			location: 'Berlin',
			department: undefined,
			published: '2026-11-02T17:49Z',
			id: '12',
			remote: 'hybrid',
			point: [13.4, 52.5],
			salary: undefined
		});
	});
	it('keeps that the indexer read where the work happens, when nothing says it', () => {
		const job = /** @type {import('#lib/ats/job.js').Job} */ (fromSnapshot({ t: 'Engineer (Remote)', u: 'https://acme.org/1', c: 'acme.org' }));
		expect(job.remote).toBe('');
		// Read already by the indexer: not read again from the title.
		expect(workplace(job)).toBe(undefined);
		expect(workplace({ ...job, remote: undefined })).toBe('remote');
	});
	it('leaves out posted jobs and unsafe links', () => {
		expect(fromSnapshot({ t: 'x', u: 'https://a.org/1', c: 'a.org', s: 'at://did:plc:a/today.joblist.job/1' })).toBe(null);
		expect(fromSnapshot({ t: 'x', u: 'javascript:alert(1)', c: 'a.org' })).toBe(null);
	});
});

describe('readJobsFile', () => {
	it('reads every board job newest first, and where posted jobs are', () => {
		const file = readJobsFile({
			generatedAt: '2026-11-07T00:00:00Z',
			checked: ['a.org'],
			jobs: [
				{ t: 'Old', u: 'https://a.org/1', c: 'a.org', p: '2026-10-01T10:00Z' },
				{ t: 'New', u: 'https://a.org/2', c: 'a.org', p: '2026-11-01T10:00Z' },
				{ t: 'Posted', u: 'https://b.org/1', c: 'b.org', s: 'at://did:plc:b/today.joblist.job/1', g: [1, 2] }
			]
		});
		expect(file?.all.map((j) => j.title)).toEqual(['New', 'Old']);
		expect(file?.points).toEqual([['at://did:plc:b/today.joblist.job/1', [1, 2]]]);
		expect(file?.checked).toEqual(['a.org']);
		expect(file?.gone).toEqual([]);
	});
	it('reads nothing from anything else', () => {
		expect(readJobsFile(null)).toBe(null);
		expect(readJobsFile({ jobs: 'x' })).toBe(null);
	});
});
