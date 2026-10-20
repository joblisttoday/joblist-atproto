import links from '#lib/data/nav.json';

/**
 * The main navigation for the current session ("Me" is the signed-in person's profile).
 * @param {string | null} handle the signed-in handle, null when signed out
 * @returns {{href: string, label: string}[]}
 */
export function navLinks(handle) {
	return links.map((link) => {
		const { href, label } = !handle && link.signedOut ? link.signedOut : link;
		return { href: href.replace('{handle}', handle || ''), label };
	});
}
