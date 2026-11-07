import { describe, expect, it } from 'vitest';

describe('drafts', () => {
	it('go with the person when signing in opens another profile', async () => {
		const data = new Map();
		globalThis.localStorage = /** @type {Storage} */ ({
			getItem: (k) => data.get(k) ?? null,
			setItem: (k, v) => void data.set(k, String(v)),
			removeItem: (k) => void data.delete(k)
		});
		const { carryDrafts } = await import('./drafts.js');
		data.set('joblist.companyDraft.v1:pwork', '{"name":"My edit"}');
		carryDrafts('pwork', 'default');
		expect(data.get('joblist.companyDraft.v1')).toBe('{"name":"My edit"}');
		expect(data.has('joblist.jobDraft.v1')).toBe(false);
	});
});
