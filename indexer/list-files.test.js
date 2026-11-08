import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listFiles } from './list-files.js';

const list = (/** @type {string} */ rkey, /** @type {object} */ value) => ({ uri: `at://did:plc:curator/today.joblist.list/${rkey}`, cid: 'c', did: 'did:plc:curator', rkey, value: { createdAt: '2026-01-01T00:00:00Z', ...value } });
const jobs = [
	{ t: 'A old', u: 'https://b.example/a1', c: 'a.org', p: '2026-10-01T00:00Z' },
	{ t: 'B', u: 'https://b.example/b1', c: 'b.org', p: '2026-11-01T00:00Z' },
	{ t: 'A new', u: 'https://b.example/a2', c: 'a.org', p: '2026-11-05T00:00Z' },
	{ t: 'Elsewhere', u: 'https://b.example/x', c: 'x.org', p: '2026-11-06T00:00Z' }
];
const suggestion = { uri: 'at://did:plc:friend/today.joblist.suggestion/s1', cid: 'c', did: 'did:plc:friend', rkey: 's1', value: { list: 'at://did:plc:curator/today.joblist.list/open', company: 'b.org', createdAt: '2026-02-01T00:00:00Z' } };

test("a list's file: its organizations' jobs newest first, and which boards were read", () => {
	const files = new Map(listFiles([list('closed', { name: 'Closed', companies: ['a.org', 'quiet.org'] })], [], jobs, { generatedAt: 'now', checked: ['a.org', 'quiet.org'], gone: ['quiet.org'] }));
	const file = files.get('did:plc:curator/closed');
	assert.deepEqual(file?.jobs.map((j) => j.t), ['A new', 'A old']);
	assert.deepEqual(file?.companies, ['a.org', 'quiet.org']);
	assert.deepEqual(file?.gone, ['quiet.org']);
});

test('an open list includes the organizations others suggested, as its page shows them', () => {
	const files = new Map(listFiles([list('open', { name: 'Open', companies: ['a.org'], open: true })], [suggestion], jobs, { generatedAt: 'now', checked: [], gone: [] }));
	assert.deepEqual(files.get('did:plc:curator/open')?.companies, ['a.org', 'b.org']);
	assert.deepEqual(files.get('did:plc:curator/open')?.jobs.map((j) => j.t), ['A new', 'B', 'A old']);
});
