import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { companiesToConnect, mergeConnection } from './connect.js';

const record = (/** @type {string} */ rkey, value = {}) => ({ rkey, uri: `at://did:h/today.joblist.company/${rkey}`, value: { name: rkey, ...value } });

describe('companiesToConnect', () => {
	const shown = [
		record('a.com'),
		record('b.com', { jobBoard: { provider: 'ashby', id: 'b' } }),
		record('c.com'),
		record('d.com'),
		record('e.com', { jobBoard: { url: 'https://e.com/careers' } })
	];
	const bluesky = { 'a.com': { did: 'did:a' }, 'b.com': { did: 'did:b' }, 'c.com': { did: 'did:c' }, 'e.com': { did: 'did:e' } };
	it('companies on Bluesky without a board, and none proposed yet, within the cap', () => {
		const repairs = new Map([['c.com', { changes: { jobBoard: { provider: 'lever', id: 'c' } } }]]);
		assert.deepEqual(
			companiesToConnect(shown, bluesky, repairs, 5).map((r) => r.rkey),
			['a.com', 'e.com']
		);
		assert.deepEqual(
			companiesToConnect(shown, bluesky, new Map(), 1).map((r) => r.rkey),
			['a.com']
		);
	});
});

describe('mergeConnection', () => {
	const found = { changes: { jobBoard: { provider: 'ashby', id: 'acme' }, url: 'https://acme.com' }, notes: ['board ashby:acme'] };
	it('starts a proposal when the repairs had none', () => {
		const p = mergeConnection(undefined, record('acme.com'), found);
		assert.equal(p.key, 'acme.com');
		assert.equal(p.confidence, 'high');
		assert.deepEqual(p.changes, found.changes);
		assert.deepEqual(p.notes, ['board ashby:acme']);
	});
	it('keeps the repair’s website and a low confidence', () => {
		const p = mergeConnection({ key: 'acme.com', changes: { url: 'https://www.acme.com' }, notes: ['website'], confidence: 'low' }, record('acme.com'), found);
		assert.equal(p.changes.url, 'https://www.acme.com');
		assert.deepEqual(p.changes.jobBoard, found.changes.jobBoard);
		assert.equal(p.confidence, 'low');
		assert.deepEqual(p.notes, ['website', 'board ashby:acme']);
	});
});
