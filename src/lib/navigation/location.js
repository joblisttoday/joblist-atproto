/**
 * Where the person is, asked from the browser only when they want jobs near them.
 * It stays in the page: never sent anywhere, never put in a link.
 * @returns {Promise<[number, number]>} [longitude, latitude]
 */
export function currentPlace() {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) return reject(new Error('unavailable'));
		navigator.geolocation.getCurrentPosition(
			({ coords }) => resolve([coords.longitude, coords.latitude]),
			reject,
			{ maximumAge: 600000, timeout: 15000 }
		);
	});
}

/**
 * The person's country, guessed from their browser's language settings ("de-DE": Germany),
 * in English (as job boards write it) and in the page's language.
 * @param {string} locale the page's language
 * @returns {{name: string, label: string} | null}
 */
export function browserCountry(locale) {
	for (const tag of navigator.languages || [navigator.language]) {
		try {
			const region = new Intl.Locale(tag).maximize().region;
			if (!region) continue;
			const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(region);
			const label = new Intl.DisplayNames([locale], { type: 'region' }).of(region);
			if (name && label) return { name, label };
		} catch {
			// not a language tag: try the next one
		}
	}
	return null;
}
