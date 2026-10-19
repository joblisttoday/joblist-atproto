import { describe, expect, it } from 'vitest';
import { tid } from './tid.js';

describe('tid', () => {
	it('is 13 sortable characters, increasing', () => {
		const a = tid(Date.parse('2026-10-19T00:00:00Z'));
		const b = tid(Date.parse('2026-10-19T00:00:00Z'));
		expect(a).toMatch(/^[234567a-j][234567a-z]{12}$/);
		expect(b > a).toBe(true);
		expect(tid(Date.parse('2027-01-01T00:00:00Z')) > b).toBe(true);
	});
});
