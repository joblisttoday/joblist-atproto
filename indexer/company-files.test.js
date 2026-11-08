import { test } from 'node:test';
import assert from 'node:assert/strict';
import { companyFiles } from './company-files.js';

const jobs = [
	{ t: 'Old', u: 'https://b.example/1', c: 'acme.org', p: '2026-01-01T00:00Z', d: 'Ops', g: /** @type {[number, number]} */ ([1, 2]) },
	{ t: 'New', u: 'https://b.example/2', c: 'acme.org', p: '2026-02-01T00:00Z', m: /** @type {[number, number, string, string]} */ ([1, 2, 'EUR', 'year']) },
	{ t: 'By acme', u: 'https://x', c: 'acme.org', p: '2026-03-01T00:00Z', s: 'at://did:plc:a/today.joblist.job/r1', v: /** @type {1} */ (1), g: /** @type {[number, number]} */ ([3, 4]) },
	{ t: 'By someone', u: 'https://y', c: 'acme.org', s: 'at://did:plc:b/today.joblist.job/r2', g: /** @type {[number, number]} */ ([5, 6]) },
	{ t: 'Elsewhere', u: 'https://z', c: 'other.org' }
];
const files = new Map(companyFiles([{ key: 'acme.org', name: 'Acme' }, { key: 'quiet.org', name: 'Quiet' }, { key: 'bad key', name: 'Bad' }], jobs, { generatedAt: 'now', checked: ['acme.org', 'quiet.org'], gone: ['quiet.org'] }));

test("a company's file: its board's jobs and its own posts, newest first, with what its page needs", () => {
	const acme = files.get('acme.org');
	assert.deepEqual(acme?.jobs.map((j) => j.t), ['By acme', 'New', 'Old']);
	assert.equal(acme?.jobs[0].u, 'https://joblist.today/job/did%3Aplc%3Aa/r1');
	assert.deepEqual(acme?.jobs[1].m, [1, 2, 'EUR', 'year']);
	assert.equal(acme?.jobs[2].d, 'Ops');
	assert.deepEqual(acme?.points, [['at://did:plc:a/today.joblist.job/r1', [3, 4]], ['at://did:plc:b/today.joblist.job/r2', [5, 6]]]);
	assert.equal(acme?.checked, true);
	assert.equal(acme?.gone, false);
});

test('a company with no jobs still has its file, saying whether its board was read or closed', () => {
	assert.deepEqual(files.get('quiet.org')?.jobs, []);
	assert.equal(files.get('quiet.org')?.gone, true);
	assert.equal(files.has('bad key'), false);
});
