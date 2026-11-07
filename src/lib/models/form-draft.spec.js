import { describe, expect, it } from 'vitest';
import { overEmpty, returningToSave } from './form-draft.js';

describe('overEmpty', () => {
	const empty = { name: '', companies: /** @type {string[]} */ ([]), open: true };

	it('keeps the fields of the same type', () => {
		expect(overEmpty(empty, { name: 'Co-ops', companies: ['a.org'], open: false })).toEqual({
			name: 'Co-ops',
			companies: ['a.org'],
			open: false
		});
	});

	it('leaves empty the fields of another type, and drops unknown ones', () => {
		expect(overEmpty(empty, { name: 3, companies: 'a.org', open: 'yes', other: 'x' })).toEqual(empty);
	});

	it('reads nothing from what is not a form', () => {
		expect(overEmpty(empty, null)).toBeNull();
		expect(overEmpty(empty, 'text')).toBeNull();
		expect(overEmpty(empty, [])).toBeNull();
	});
});

describe('returningToSave', () => {
	const now = 1_000_000;
	const max = 60_000;

	it('is true back on the same form, soon after leaving it', () => {
		expect(returningToSave({ form: 'list', at: now - 1000 }, 'list', now, max)).toBe(true);
	});

	it('is false on another form, too late, or with nothing kept', () => {
		expect(returningToSave({ form: 'job', at: now - 1000 }, 'list', now, max)).toBe(false);
		expect(returningToSave({ form: 'list', at: now - max - 1 }, 'list', now, max)).toBe(false);
		expect(returningToSave({ form: 'list', at: now + 1000 }, 'list', now, max)).toBe(false);
		expect(returningToSave(null, 'list', now, max)).toBe(false);
		expect(returningToSave({ form: 'list' }, 'list', now, max)).toBe(false);
	});
});
