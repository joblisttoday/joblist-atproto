import { beforeEach, describe, expect, it } from 'vitest';
import { accounts, addAccount, currentAccount, readAccounts, removeAccount, resetAccounts, useAccount, useDevice } from './accounts.js';

/** A localStorage stand-in. */
function memory(entries = {}) {
	const data = new Map(Object.entries(entries));
	return /** @type {Storage} */ ({
		get length() {
			return data.size;
		},
		key: (i) => [...data.keys()][i] ?? null,
		getItem: (k) => data.get(k) ?? null,
		setItem: (k, v) => void data.set(k, String(v)),
		removeItem: (k) => void data.delete(k),
		clear: () => data.clear()
	});
}

beforeEach(() => {
	globalThis.localStorage = memory();
	resetAccounts();
});

describe('accounts', () => {
	it('keeps the accounts of older profiles, the one in use first', () => {
		const store = memory({
			'joblist.profiles.v1': JSON.stringify({
				current: 'pwork',
				list: [
					{ id: 'default', name: '@me.example', did: 'did:plc:me' },
					{ id: 'pwork', name: 'Work', did: 'did:plc:org' },
					{ id: 'pfriend', name: 'Friend' }
				]
			})
		});
		expect(readAccounts(store)).toEqual({ current: 'did:plc:org', list: [{ did: 'did:plc:me', handle: 'me.example' }, { did: 'did:plc:org' }] });
	});
	it('keeps an older sign-in, from before profiles', () => {
		expect(readAccounts(memory({ 'joblist.session.v1': 'did:plc:me' }))).toEqual({ current: 'did:plc:me', list: [{ did: 'did:plc:me' }] });
	});
	it('adds accounts, switches, and is this device again when the one in use signs out (never another account)', () => {
		addAccount('did:plc:me', 'me.example');
		addAccount('did:plc:org', 'org.example');
		expect(currentAccount()).toBe('did:plc:org');
		useAccount('did:plc:me');
		expect(currentAccount()).toBe('did:plc:me');
		useAccount('did:plc:nobody');
		expect(currentAccount()).toBe('did:plc:me');
		removeAccount('did:plc:me');
		expect(accounts()).toEqual({ current: null, list: [{ did: 'did:plc:org', handle: 'org.example' }] });
		useAccount('did:plc:org');
		useDevice();
		expect(accounts()).toEqual({ current: null, list: [{ did: 'did:plc:org', handle: 'org.example' }] });
		removeAccount('did:plc:org');
		expect(currentAccount()).toBe(null);
		resetAccounts();
		expect(accounts().list).toEqual([]);
	});
});
