import { test } from 'node:test';
import assert from 'node:assert/strict';
import { limitAccounts, limitBoards } from './caps.js';

const NOW = Date.parse('2026-11-01T00:00:00Z');
const DAY = 864e5;

/** @param {string} did @param {string} rkey @param {Record<string, any>} value */
const rec = (did, rkey, value) => ({ did, rkey, uri: `at://${did}/x/${rkey}`, cid: '', value });

test('limitAccounts caps each account per type, bots exempt, and records to their lexicon', () => {
	const companies = [
		...Array.from({ length: 5 }, (_, i) => rec('did:plc:spam', `c${i}.org`, { name: 'x'.repeat(500), createdAt: '2026-01-01' })),
		...Array.from({ length: 5 }, (_, i) => rec('did:plc:bot', `b${i}.org`, { name: 'B', createdAt: '2026-01-01' }))
	];
	const live = (/** @type {number} */ days) => ({ title: 'E', company: 'a.org', url: 'https://a.org/1', createdAt: new Date(NOW - days * DAY).toISOString(), expiresAt: new Date(NOW + DAY).toISOString() });
	const expired = { title: 'Old', company: 'a.org', url: 'https://a.org/2', createdAt: new Date(NOW).toISOString(), expiresAt: new Date(NOW - DAY).toISOString() };
	const jobs = [rec('did:plc:spam', 'j1', expired), rec('did:plc:spam', 'j2', live(5)), rec('did:plc:spam', 'j3', live(1))];
	const { records, dropped } = limitAccounts({ company: companies, job: jobs }, { company: 2, job: 2 }, ['did:plc:bot'], NOW);
	assert.equal(records.company.filter((r) => r.did === 'did:plc:spam').length, 2);
	assert.equal(records.company.filter((r) => r.did === 'did:plc:bot').length, 5);
	assert.equal(records.company[0].value.name.length, 100);
	assert.deepEqual(records.job.map((r) => r.rkey), ['j3', 'j2']);
	assert.deepEqual(dropped, [
		{ did: 'did:plc:spam', type: 'company', count: 3 },
		{ did: 'did:plc:spam', type: 'job', count: 1 }
	]);
});

test('limitBoards reads a bounded number of boards per account and in all, own companies first', () => {
	/** @param {string} key @param {string} did @param {boolean} [verified] */
	const company = (key, did, verified = false) => /** @type {any} */ ({ key, verified, jobBoard: { provider: 'lever', id: key }, record: { did } });
	const companies = [
		...Array.from({ length: 4 }, (_, i) => company(`fake${i}.org`, 'did:plc:spam')),
		company('bot.org', 'did:plc:bot'),
		company('own.org', 'did:plc:own', true),
		/** @type {any} */ ({ key: 'none.org', verified: false, record: { did: 'did:plc:spam' } })
	];
	const { kept, dropped, overTotal } = limitBoards(companies, { perAccount: 2, total: 4, exempt: ['did:plc:bot'] });
	assert.deepEqual(kept.map((c) => c.key), ['own.org', 'bot.org', 'fake0.org', 'fake1.org']);
	assert.deepEqual(dropped, [{ did: 'did:plc:spam', count: 2 }]);
	assert.equal(overTotal, 0);
	assert.equal(limitBoards(companies, { perAccount: 9, total: 3, exempt: [] }).overTotal, 3);
});
