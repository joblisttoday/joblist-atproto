import { describe, expect, it } from 'vitest';
import { recordKey } from './records.js';

describe('recordKey', () => {
	const did = 'did:plc:abc';
	const collection = 'today.joblist.company';
	it('reads the key of a record from the repository and collection asked', () => {
		expect(recordKey(`at://${did}/${collection}/acme.org`, did, collection)).toBe('acme.org');
	});
	it('refuses keys that could become another path, and records from elsewhere', () => {
		expect(recordKey(`at://${did}/${collection}/..%2F..%2Fx`, did, collection)).toBe('');
		expect(recordKey(`at://${did}/${collection}/..`, did, collection)).toBe('');
		expect(recordKey(`at://${did}/${collection}/a/b`, did, collection)).toBe('');
		expect(recordKey(`at://did:plc:other/${collection}/acme.org`, did, collection)).toBe('');
		expect(recordKey(`at://${did}/today.joblist.list/acme.org`, did, collection)).toBe('');
	});
});
