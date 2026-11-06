import { describe, expect, it } from 'vitest';
import { safeUrl } from './url.js';

describe('safeUrl', () => {
	it('keeps web links', () => {
		expect(safeUrl('https://acme.org/jobs')).toBe('https://acme.org/jobs');
		expect(safeUrl(' http://acme.org ')).toBe('http://acme.org');
	});
	it('drops links that could run script, and anything else', () => {
		expect(safeUrl('javascript:alert(1)')).toBe('');
		expect(safeUrl('JavaScript:alert(1)')).toBe('');
		expect(safeUrl('data:text/html,<script>')).toBe('');
		expect(safeUrl('acme.org')).toBe('');
		expect(safeUrl(undefined)).toBe('');
	});
	it('keeps email only when asked', () => {
		expect(safeUrl('mailto:jobs@acme.org')).toBe('');
		expect(safeUrl('mailto:jobs@acme.org', { email: true })).toBe('mailto:jobs@acme.org');
	});
});
