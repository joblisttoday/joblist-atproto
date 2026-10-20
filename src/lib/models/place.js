import places from '#lib/data/places.json' with { type: 'json' };

/**
 * Job locations as job boards write them ("Remote - USA", "US Remote",
 * "Berlin, Germany | Remote (EMEA)"), made comparable: one spelling per place,
 * and regions named alongside their countries.
 */

/** @param {string} text */
function clean(text) {
	return ` ${text
		.toLowerCase()
		.replace(/\./g, '')
		.replace(/[^\p{L}\p{N}%]+/gu, ' ')
		.trim()} `;
}

/** Every other spelling and its usual one, longest first (so "united states of america" goes before "america"). */
const spellings = [
	...places.same.flatMap(([usual, ...others]) => others.map((o) => [clean(o), clean(usual)])),
	...Object.entries(places.regions).flatMap(([region, names]) => names.map((n) => [clean(n), clean(region)]))
]
	.filter(([other, usual]) => other !== usual)
	.sort((a, b) => b[0].length - a[0].length);

const regionOf = new Map(
	Object.entries(places.countries).flatMap(([region, names]) => names.map((n) => [clean(n), region]))
);
const anywhere = places.anywhere.map(clean);
const noise = places.remoteNoise.map(clean);

/**
 * A place text with one spelling per place, between spaces: " united states berlin ".
 * @param {string} text
 */
export function canonical(text) {
	let out = clean(text);
	for (const [other, usual] of spellings) {
		while (out.includes(other)) out = out.replace(other, usual);
	}
	return out;
}

const countryOf = new Map(
	Object.entries(places.cities).flatMap(([country, cities]) => cities.map((c) => [clean(c), clean(country)]))
);

/** @type {Map<string, string>} */
const expanded = new Map();

/**
 * A location with the regions of its places: "Berlin, Germany" also says europe.
 * remote: also the places of its regions ("Remote (EMEA)" also says germany, france…),
 * as a remote job limited to a region can be done from any of them.
 * @param {string} location
 * @param {boolean} remote
 */
function searchable(location, remote) {
	const key = `${remote ? 'r' : 'o'}${location}`;
	let text = expanded.get(key);
	if (text === undefined) {
		text = canonical(location);
		const extra = new Set();
		for (const [place, region] of regionOf) if (text.includes(place)) extra.add(region);
		if (remote) {
			for (const [region, names] of Object.entries(places.countries)) {
				if (text.includes(` ${region} `)) for (const place of names) extra.add(place);
			}
		}
		text = `${text}${[...extra].join(' ')} `;
		expanded.set(key, text);
	}
	return text;
}

/**
 * Whether a location is in the place someone typed: every word of it starts a word of the location.
 * remote: the job is remote, so a city also matches its country ("berlin" is in a job limited to Germany).
 * @param {string | undefined} location
 * @param {string} where
 * @param {boolean} [remote]
 */
export function inPlace(location, where, remote = false) {
	const place = canonical(where);
	const text = searchable(location || '', remote);
	const has = (/** @type {string} */ value) => value.trim().split(' ').filter(Boolean).every((w) => text.includes(` ${w}`));
	if (!place.trim()) return true;
	return has(place) || (remote && countryOf.has(place) ? has(/** @type {string} */ (countryOf.get(place))) : false);
}

/**
 * Where a remote job can be done from, as its location says: "Remote - USA" → "united states".
 * Empty when it names no place, or says anywhere / worldwide.
 * @param {string | undefined} location
 * @param {string[]} remoteWords
 */
export function remoteRegion(location, remoteWords) {
	let text = canonical(location || '');
	for (const word of [...remoteWords.map(clean), ...anywhere, ...noise]) {
		while (text.includes(word)) text = text.replace(word, ' ');
	}
	return text.trim();
}
