import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seeVersions } from './seen.js';

const NOW = '2026-11-07T12:00:00.000Z';
/** @param {string} did @param {string} cid @param {Record<string, any>} value */
const version = (did, cid, value) => ({ did, rkey: 'acme.org', uri: `at://${did}/today.joblist.company/acme.org`, cid, value: { name: 'Acme', ...value } });

test('the first run believes past dates; later runs date new versions when first seen', () => {
	const old = version('did:plc:old', 'c1', { createdAt: '2025-01-01T00:00:00Z' });
	const first = seeVersions([old], [], {}, NOW, 7);
	assert.equal(first.records[0].seenAt, '2025-01-01T00:00:00.000Z');
	assert.equal(first.ledger.accounts['did:plc:old'], '2025-01-01T00:00:00.000Z');
	// A version claiming an old date is still seen now; a known one keeps its date.
	const sneaky = version('did:plc:x', 'c2', { createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-11-07T11:00:00Z' });
	const later = '2026-11-08T00:00:00.000Z';
	const second = seeVersions([old, sneaky], [], first.ledger, later, 7);
	assert.deepEqual(second.records.map((r) => r.seenAt), ['2025-01-01T00:00:00.000Z', later]);
	assert.equal(second.added, 1);
	assert.equal(second.ledger.accounts['did:plc:x'], later);
});

test('a new account replacing an older version by someone else is marked', () => {
	const ledger = { records: { 'at://did:plc:old/today.joblist.company/acme.org c1': '2025-01-01T00:00:00.000Z' }, accounts: { 'did:plc:old': '2025-01-01T00:00:00.000Z', 'did:plc:est': '2025-06-01T00:00:00.000Z' } };
	const old = version('did:plc:old', 'c1', {});
	const fresh = version('did:plc:new', 'c9', {});
	const established = { ...version('did:plc:est', 'c5', {}), rkey: 'acme.org' };
	const { records, newAuthors } = seeVersions([old, fresh, established], [], ledger, NOW, 7);
	assert.deepEqual(records.map((r) => [r.did, Boolean(r.newAuthor)]), [
		['did:plc:old', false],
		['did:plc:new', true],
		['did:plc:est', false]
	]);
	assert.equal(newAuthors, 1);
	// A new account describing a company nobody else did is not marked.
	const alone = { ...version('did:plc:new', 'c3', {}), rkey: 'other.org', uri: 'at://did:plc:new/today.joblist.company/other.org' };
	assert.equal(seeVersions([alone], [], ledger, NOW, 7).records[0].newAuthor, undefined);
});
