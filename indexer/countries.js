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
for (const a of letters)
	for (const b of letters) {
		const name = regionNames.of(a + b);
		if (name && name !== a + b) names.add(name.toLowerCase());
	}
for (const city of config.geocode.cityCountries) names.delete(city);

/** @param {string} place */
export function isCountry(place) {
	return names.has(place.toLowerCase().trim());
}
