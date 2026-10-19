import config from '#lib/data/config.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

/** @type {Record<string, Record<string, string>>} */
const messages = { en, fr };
const KEY = 'joblist.locale';

export const i18n = $state({ locale: initialLocale() });

function initialLocale() {
	try {
		const stored = localStorage.getItem(KEY);
		if (stored && messages[stored]) return stored;
		const browser = navigator.language.slice(0, 2);
		if (messages[browser]) return browser;
	} catch {
		// no storage or navigator during build
	}
	return config.defaultLocale;
}

/** @param {string} locale */
export function setLocale(locale) {
	i18n.locale = locale;
	try {
		localStorage.setItem(KEY, locale);
	} catch {
		// remembered for this visit only
	}
}

/**
 * Translate a key, filling {placeholders}.
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
export function t(key, vars = {}) {
	// "{count} jobs" can have a "….one" variant for a count of 1.
	if (vars.count === 1 && `${key}.one` in messages[config.defaultLocale]) key = `${key}.one`;
	const text = messages[i18n.locale]?.[key] ?? messages[config.defaultLocale][key] ?? key;
	return text.replace(/\{(\w+)\}/g, (_, name) => {
		const value = vars[name];
		if (typeof value === 'number') return value.toLocaleString(i18n.locale);
		return String(value ?? `{${name}}`);
	});
}
