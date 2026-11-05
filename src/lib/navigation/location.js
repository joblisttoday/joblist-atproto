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
