import { describe, expect, it } from 'vitest';
import { capRecord, cutText } from './limits.js';

describe('capRecord', () => {
	it('cuts free text and lists to the lexicon limits', () => {
		const value = capRecord('today.joblist.company', {
			name: 'n'.repeat(500),
			description: 'd'.repeat(50000),
			tags: Array.from({ length: 100 }, (_, i) => `${'t'.repeat(100)}${i}`),
			locations: Array.from({ length: 80 }, () => ({ name: 'Berlin', latitude: '52.5', extra: 'x'.repeat(1000) })),
			links: Array.from({ length: 30 }, (_, i) => `https://a.org/${i}`),
			createdAt: '2026-01-01T00:00:00Z'
		});
		expect(value.name).toHaveLength(100);
		expect(value.description).toHaveLength(3000);
		expect(value.tags).toHaveLength(20);
		expect(value.tags[0]).toHaveLength(64);
		expect(value.locations).toHaveLength(50);
		expect(value.locations[0]).toEqual({ name: 'Berlin', latitude: '52.5' });
		expect(value.links).toHaveLength(20);
		expect(value.$type).toBe('today.joblist.company');
	});
	it('leaves out what is not in the lexicon or of the wrong type', () => {
		const value = capRecord('today.joblist.job', { title: 'E', company: 42, junk: 'x'.repeat(1e6), apply: { bluesky: 'yes', url: 'mailto:a@b.org' } });
		expect(value).toEqual({ $type: 'today.joblist.job', title: 'E', apply: { url: 'mailto:a@b.org' } });
		expect(capRecord('today.joblist.list', null)).toEqual({});
	});
	it('leaves out codes and links past their limits rather than cut them', () => {
		const value = capRecord('today.joblist.job', {
			title: 'E',
			url: `https://a.org/${'x'.repeat(9000)}`,
			salary: { min: 1, currency: 'euros', period: 'year' },
			applicantLocations: ['DE', 'FRA']
		});
		expect(value.url).toBeUndefined();
		expect(value.salary).toEqual({ min: 1, period: 'year' });
		expect(value.applicantLocations).toEqual(['DE']);
	});
	it('caps lists and suggestions too', () => {
		expect(capRecord('today.joblist.list', { name: 'L', companies: Array.from({ length: 3000 }, (_, i) => `c${i}.org`) }).companies).toHaveLength(2000);
		expect(capRecord('today.joblist.suggestion', { note: 'n'.repeat(1000) }).note).toHaveLength(300);
	});
});

describe('cutText', () => {
	it('never splits a character', () => {
		expect(cutText('a😀b', 2)).toBe('a😀');
		expect(cutText('short', 10)).toBe('short');
	});
});
