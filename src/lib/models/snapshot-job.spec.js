import { describe, expect, it } from 'vitest';
import { fromSnapshot, listFileName, listFilePath, readCompanyFile, readJobsFile } from './snapshot-job.js';
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

describe('readCompanyFile', () => {
	it("reads a company's file as the snapshot's jobs, posted ones left to their records", () => {
		const file = readCompanyFile('acme.org', {
			generatedAt: '2026-11-08T00:00:00Z',
			checked: true,
			gone: false,
			jobs: [
				{ t: 'Posted', u: 'https://joblist.today/job/x/y', c: 'acme.org', s: 'at://x/today.joblist.job/y' },
				{ t: 'Designer', u: 'https://boards.example/acme/42', c: 'acme.org', d: 'Design', r: 'remote' }
			],
			points: [['at://x/today.joblist.job/y', [1, 2]]]
		});
		expect(file?.all.map((j) => [j.title, j.department, j.remote, j.id])).toEqual([['Designer', 'Design', 'remote', '42']]);
		expect(file?.checked).toEqual(['acme.org']);
		expect(file?.gone).toEqual([]);
		expect(file?.points).toEqual([['at://x/today.joblist.job/y', [1, 2]]]);
	});

	it('is null for a file from before it said whether the board was read', () => {
		expect(readCompanyFile('acme.org', { generatedAt: 'x', name: 'Acme', jobs: [] })).toBe(null);
	});
});

describe('listFileName', () => {
	it('puts a DID in folders: no colon in any file name', () => {
		const list = { did: 'did:plc:abc', rkey: '3my7zpwloir2s' };
		expect(listFileName(list)).toBe('lists/plc/abc/3my7zpwloir2s.json');
		expect(listFilePath(list)).toBe('lists/plc/abc/3my7zpwloir2s.json');
	});
	it('escapes the unusual, and reads it back under the same name', () => {
		const list = { did: 'did:web:example.com%3A8080', rkey: 'a:b' };
		expect(listFileName(list)).toBe('lists/web/example.com%253A8080/a%3Ab.json');
		expect(listFilePath(list)).toBe('lists/web/example.com%25253A8080/a%253Ab.json');
		expect(listFileName({ did: 'did:web:..', rkey: 'x' })).toBe('lists/web/%2E%2E/x.json');
	});
});
