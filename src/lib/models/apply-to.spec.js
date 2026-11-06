import { describe, expect, it } from 'vitest';
import { readApplyTo } from './apply-to.js';

describe('readApplyTo', () => {
	it('says whether applications go by email or to a link', () => {
		expect(readApplyTo('')).toBe(null);
		expect(readApplyTo('jobs@acme.org')).toEqual({ kind: 'email', to: 'jobs@acme.org' });
		expect(readApplyTo('www.acme.org/jobs/1')).toEqual({ kind: 'link', to: 'acme.org' });
		expect(readApplyTo('send us a note')).toEqual({ kind: 'unclear' });
	});
});
