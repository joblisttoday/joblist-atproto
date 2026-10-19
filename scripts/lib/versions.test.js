import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { botVersion, decide, displayedVersion } from './versions.js';

const BOT = 'did:bot';
const ctx = { botDid: BOT, bots: [BOT, 'did:otherbot'], checkedAt: '2026-10-10T00:00:00Z' };

/** @param {string} did @param {string} date @param {Record<string, any>} [extra] */
const version = (did, date, extra = {}) => ({ did, rkey: 'acme.org', uri: `at://${did}/today.joblist.company/acme.org`, value: { name: did, createdAt: date, ...extra } });

describe('displayedVersion', () => {
	it('shows the company itself first', () => {
		const profiles = new Map([['did:org', { handle: 'acme.org' }]]);
		const versions = [version('did:a', '2026-03-01'), version('did:org', '2026-01-01')];
		assert.equal(displayedVersion(versions, profiles).did, 'did:org');
	});
	it('otherwise the most recently edited, by updatedAt then createdAt', () => {
		const versions = [version('did:a', '2026-03-01'), version('did:b', '2026-01-01', { updatedAt: '2026-04-01' })];
		assert.equal(displayedVersion(versions, new Map()).did, 'did:b');
	});
});

describe('decide', () => {
	it('never touches a company that wrote its own record', () => {
		const profiles = new Map([['did:org', { handle: 'acme.org' }]]);
		const result = decide([version('did:org', '2026-01-01')], profiles, ctx);
		assert.ok('skip' in result);
	});
	it('skips when a person edited after the health check', () => {
		const result = decide([version('did:a', '2026-10-12T00:00:00Z')], new Map(), ctx);
		assert.deepEqual(result, { skip: 'a person edited it after the health check' });
	});
	it('builds on an older human version', () => {
		const result = decide([version('did:a', '2026-01-01')], new Map(), ctx);
		assert.ok('base' in result && result.base.did === 'did:a' && !result.mine);
	});
	it('backs off for good once a person edits after the crawler', () => {
		const versions = [version(BOT, '2026-02-01'), version('did:a', '2026-01-01', { updatedAt: '2026-03-01' })];
		assert.deepEqual(decide(versions, new Map(), ctx), { skip: 'a person edited it after the crawler' });
	});
	it('updates its own version when it is the newest', () => {
		const versions = [version(BOT, '2026-02-01'), version('did:a', '2026-01-01')];
		const result = decide(versions, new Map(), ctx);
		assert.ok('mine' in result && result.mine?.did === BOT && result.base.did === BOT);
	});
	it('builds on another crawler’s version even if newer than the check', () => {
		const result = decide([version('did:otherbot', '2026-10-12T00:00:00Z')], new Map(), ctx);
		assert.ok('base' in result && result.base.did === 'did:otherbot');
	});
});

describe('botVersion', () => {
	const base = version('did:a', '2026-01-01', { url: 'https://acme.org', tags: ['food'], jobBoard: { provider: 'lever', id: 'acme' } });
	it('copies the displayed version and changes only the repaired fields', () => {
		const value = botVersion(base, { jobBoard: { provider: 'ashby', id: 'acme' } }, undefined, '2026-10-19T00:00:00Z');
		assert.deepEqual(value, {
			name: 'did:a',
			url: 'https://acme.org',
			tags: ['food'],
			jobBoard: { provider: 'ashby', id: 'acme' },
			$type: 'today.joblist.company',
			createdAt: '2026-10-19T00:00:00Z',
			updatedAt: '2026-10-19T00:00:00Z'
		});
	});
	it('keeps its own createdAt when updating', () => {
		const mine = version(BOT, '2026-05-01');
		assert.equal(botVersion(base, { url: 'https://acme.com' }, mine, '2026-10-19')?.createdAt, '2026-05-01');
	});
	it('writes nothing when nothing changes', () => {
		assert.equal(botVersion(base, { url: 'https://acme.org' }, undefined, '2026-10-19'), null);
	});
});
