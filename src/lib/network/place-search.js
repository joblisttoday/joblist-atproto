import config from '#lib/data/config.json';
import { toFoundPlace } from '#lib/models/place-search.js';

/**
 * Cities and places whose name starts as typed, in the reader's language.
 * @param {string} text
 * @param {string} lang
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('#lib/models/place-search.js').FoundPlace[]>}
 */
export async function searchPlaces(text, lang, signal) {
	const url = new URL(config.services.placeSearch);
	url.searchParams.set('q', text);
	url.searchParams.set('limit', String(config.placeSearch.limit));
	if (config.placeSearch.languages.includes(lang)) url.searchParams.set('lang', lang);
	for (const layer of config.placeSearch.layers) url.searchParams.append('layer', layer);
	const res = await fetch(url, { signal });
	if (!res.ok) return [];
	const { features = [] } = await res.json();
	return features.map(toFoundPlace).filter(Boolean);
}
