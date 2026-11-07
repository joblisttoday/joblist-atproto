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
 * A US state written as its code after a comma ("San Francisco, CA"), unless a
 * place other than the United States follows: "Madrid, MD, Spain" is not Maryland.
 */
const usState = new RegExp(
	`,\\s*(${Object.keys(places.usStates).join('|')})\\b(?!\\s*,(?!\\s*(US|USA|U\\.S\\.A?\\.?|United States)\\b))`,
	'g'
);

/**
 * A location with its US state codes written out: "Austin, TX" → "Austin, Texas".
 * @param {string} text
 */
export function expandStates(text) {
	return text.replace(usState, (_, code) => `, ${places.usStates[/** @type {keyof typeof places.usStates} */ (code)]}`);
}

/**
 * A place text with one spelling per place, between spaces: " united states berlin ".
 * @param {string} text
 */
export function canonical(text) {
	let out = clean(expandStates(text));
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
	return placeMatcher(where)(location, remote);
}

/**
 * inPlace for one typed place, made once for a whole search: the place is read
 * once, and each location (there are far fewer than jobs) is matched once.
 * @param {string} where
 * @returns {(location: string | undefined, remote?: boolean) => boolean}
 */
export function placeMatcher(where) {
	const place = canonical(where);
	if (!place.trim()) return () => true;
	const words = place.trim().split(' ').filter(Boolean);
	const country = countryOf.get(place);
	const countryWords = country ? country.trim().split(' ').filter(Boolean) : null;
	/** @type {Map<string, boolean>} */
	const seen = new Map();
	return (location, remote = false) => {
		const key = `${remote ? 'r' : 'o'}${location || ''}`;
		let found = seen.get(key);
		if (found === undefined) {
			const text = searchable(location || '', remote);
			const has = (/** @type {string[]} */ list) => list.every((w) => text.includes(` ${w}`));
			found = has(words) || Boolean(remote && countryWords && has(countryWords));
			seen.set(key, found);
		}
		return found;
	};
}

/** @type {Map<string, string>} */
const regions = new Map();

/**
 * Where a remote job can be done from, as its location says: "Remote - USA" → "united states".
 * Empty when it names no place, or says anywhere / worldwide.
 * @param {string | undefined} location
 * @param {string[]} remoteWords
 */
export function remoteRegion(location, remoteWords) {
	const key = location || '';
	const known = regions.get(key);
	if (known !== undefined) return known;
	let text = canonical(key);
	for (const word of [...remoteWords.map(clean), ...anywhere, ...noise]) {
		while (text.includes(word)) text = text.replace(word, ' ');
	}
	text = text.trim();
	regions.set(key, text);
	return text;
}
