import { beforeEach, describe, expect, it } from 'vitest';
import { addProfile, attachAccount, currentProfile, detachAccount, profiles, readProfiles, removeProfile, renameProfile, resetProfiles, scoped, useProfile } from './profiles.js';

/** A localStorage stand-in. */
function memory() {
	const data = new Map();
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
	resetProfiles();
});

describe('profiles', () => {
	it('starts with one, keeping what was kept before (and an older sign-in)', () => {
		localStorage.setItem('joblist.session.v1', 'did:plc:me');
		expect(readProfiles()).toEqual({ current: 'default', list: [{ id: 'default', name: '', did: 'did:plc:me' }] });
		expect(scoped('joblist.searches.v1')).toBe('joblist.searches.v1');
	});
	it('keeps each profile apart, and switches', () => {
		const id = addProfile(' Dream jobs ');
		expect(currentProfile()).toEqual({ id, name: 'Dream jobs' });
		expect(scoped('joblist.searches.v1')).toBe(`joblist.searches.v1:${id}`);
		renameProfile(id, 'Other');
		useProfile('default');
		resetProfiles();
		expect(profiles().current).toBe('default');
		expect(profiles().list.map((p) => p.name)).toEqual(['', 'Other']);
	});
	it('an account belongs to one profile: signing in to it again goes there', () => {
		attachAccount('did:plc:me', 'me.example');
		expect(currentProfile()).toEqual({ id: 'default', name: '@me.example', did: 'did:plc:me' });
		const id = addProfile('Work');
		expect(attachAccount('did:plc:me')).toBe(true);
		expect(profiles().current).toBe('default');
		useProfile(id);
		expect(attachAccount('did:plc:work', 'work.example')).toBe(false);
		detachAccount('did:plc:work');
		expect(currentProfile().did).toBe(undefined);
	});
	it('removing one removes what it kept, never the first one', () => {
		const id = addProfile('Temp');
		localStorage.setItem(scoped('joblist.searches.v1'), '[1]');
		localStorage.setItem('joblist.searches.v1', '[0]');
		removeProfile(id);
		removeProfile('default');
		expect(localStorage.getItem(`joblist.searches.v1:${id}`)).toBe(null);
		expect(localStorage.getItem('joblist.searches.v1')).toBe('[0]');
		expect(profiles()).toEqual({ current: 'default', list: [{ id: 'default', name: '' }] });
	});
	it('ignores a broken file', () => {
		localStorage.setItem('joblist.profiles.v1', '{"current":"x","list":[{"id":"../bad"},null]}');
		expect(readProfiles()).toEqual({ current: 'default', list: [{ id: 'default', name: '' }] });
	});
});
