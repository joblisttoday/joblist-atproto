import { describe, expect, it } from 'vitest';
import { fromSnapshot } from './snapshot-job.js';
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
