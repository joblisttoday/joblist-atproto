/**
 * Country names, in English, from the platform's own list of regions: a job's place that
 * is only a country ("Remote - Brazil") is too wide for a point, and asked as a
 * settlement it would find a town of that name (Brazil, Indiana).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
/** @type {Set<string>} */
const names = new Set(config.geocode.countryWords);
/** Country codes by English name. @type {Map<string, string>} */
const codes = new Map();
for (const a of letters)
	for (const b of letters) {
		const name = regionNames.of(a + b);
		if (name && name !== a + b) {
			names.add(name.toLowerCase());
			// The code in use, not an old one of the same name (DD, FX: Germany, France).
			if (new Intl.Locale(`und-${a}${b}`).region === a + b) codes.set(name.toLowerCase(), a + b);
		}
	}
for (const city of config.geocode.cityCountries) names.delete(city);

/** @param {string} place */
export function isCountry(place) {
	return names.has(place.toLowerCase().trim());
}

/**
 * A country's ISO 3166-1 code ("Germany", "de", "UK": DE, DE, GB), as search engines want it.
 * @param {string | undefined} country
 * @returns {string | undefined}
 */
export function countryCode(country) {
	const text = (country || '').trim().toLowerCase();
	if (!text) return undefined;
	const alias = /** @type {Record<string, string>} */ (config.geocode.countryAliases)[text];
	if (alias) return alias.toUpperCase();
	if (/^[a-z]{2}$/.test(text) && regionNames.of(text.toUpperCase()) !== text.toUpperCase()) return text.toUpperCase();
	return codes.get(text);
}
