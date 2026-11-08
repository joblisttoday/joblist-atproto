import { describe, expect, it } from 'vitest';
import { nextToSend, notReached, overlay } from './outbox.js';

const entry = (/** @type {Partial<import('./outbox.js').OutboxEntry>} */ e) => ({ id: e.rkey || 'x', did: 'did:plc:me', op: /** @type {const} */ ('put'), collection: 'today.joblist.list', rkey: 'a', at: '', ...e });

describe('outbox', () => {
	it('tells "not reached" from "refused"', () => {
		expect(notReached(new TypeError('Failed to fetch'))).toBe(true);
		expect(notReached(Object.assign(new Error('Unknown'), { status: 1, cause: new TypeError('Load failed') }))).toBe(true);
		expect(notReached(Object.assign(new Error('Invalid record'), { status: 400 }))).toBe(false);
		expect(notReached(new Error('anything'), false)).toBe(true);
	});

	it('shows the records as they will be once sent', () => {
		const records = [
			{ did: 'did:plc:me', rkey: 'a', uri: 'at://did:plc:me/today.joblist.list/a', cid: 'c1', value: { name: 'Old' } },
			{ did: 'did:plc:me', rkey: 'b', uri: 'at://did:plc:me/today.joblist.list/b', cid: 'c2', value: { name: 'B' } }
		];
		const entries = [
			entry({ rkey: 'a', record: { name: 'New' } }),
			entry({ rkey: 'b', op: 'delete' }),
			entry({ rkey: 'c', record: { name: 'C' } }),
			entry({ rkey: 'd', record: { name: 'Refused' }, error: 'Invalid' }),
			entry({ rkey: 'e', collection: 'today.joblist.company', record: { name: 'Other' } })
		];
		expect(overlay(records, entries, 'today.joblist.list').map((r) => [r.rkey, r.value.name, r.cid, r.waiting])).toEqual([
			['a', 'New', '', true],
			['c', 'C', '', true]
		]);
	});

	it('sends in order, never past a refused write of the same record', () => {
		const entries = [entry({ id: '1', rkey: 'a', error: 'Invalid' }), entry({ id: '2', rkey: 'a' }), entry({ id: '3', rkey: 'b' }), entry({ id: '4', rkey: 'c', did: 'did:plc:other' })];
		expect(nextToSend(entries, 'did:plc:me')?.id).toBe('3');
		expect(nextToSend(entries, 'did:plc:other')?.id).toBe('4');
		expect(nextToSend([], 'did:plc:me')).toBe(undefined);
	});
});
