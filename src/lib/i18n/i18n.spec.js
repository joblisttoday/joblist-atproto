import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
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
	const placeholders = (/** @type {string} */ text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
	for (const [name, messages] of Object.entries({ fr, de, es })) {
		it(`${name}: every key of English, with the same placeholders`, () => {
			const strings = /** @type {Record<string, string>} */ (messages);
			expect(Object.keys(en).filter((key) => !(key in strings))).toEqual([]);
			expect(Object.keys(strings).filter((key) => !(key in en))).toEqual([]);
			const differ = Object.entries(en).filter(([key, text]) => key in strings && placeholders(text).join() !== placeholders(strings[key]).join());
			expect(differ.map(([key]) => key)).toEqual([]);
		});
	}
});
