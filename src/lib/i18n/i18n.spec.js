import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import fr from './locales/fr.json';
import { formatNumber, i18n, t } from './index.svelte.js';

describe('t', () => {
	it('uses the singular for a count of 1, in each language', () => {
		i18n.locale = 'en';
		expect(t('jobs.count', { count: 1 })).toBe(en['jobs.count.one']);
		expect(t('jobs.count', { count: 2 })).toBe('2 open jobs');
		i18n.locale = 'fr';
		expect(t('searches.new', { count: 1 })).toBe(fr['searches.new.one']);
	});

	it('writes numbers as the language does', () => {
		i18n.locale = 'en';
		expect(t('jobs.count', { count: 28180 })).toBe('28,180 open jobs');
		i18n.locale = 'fr';
		expect(formatNumber(28180)).toBe((28180).toLocaleString('fr'));
		expect(t('jobs.count', { count: 28180 })).toContain(formatNumber(28180));
	});
});

describe('locales', () => {
	it('say every count both ways in French too', () => {
		const singular = Object.keys(en).filter((key) => key.endsWith('.one'));
		expect(singular.filter((key) => !(key in fr))).toEqual([]);
	});
});
