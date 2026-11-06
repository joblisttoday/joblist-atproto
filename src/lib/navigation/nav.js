import links from '#lib/data/nav.json';

/**
 * The main navigation for the current session ("Me" is the signed-in person's profile).
 * wide: only on wide screens, where there is room (phones keep five tabs).
 * @param {string | null} handle the signed-in handle, null when signed out
 * @returns {{href: string, label: string, wide?: boolean}[]}
 */
export function navLinks(handle) {
	return links.map((link) => {
		const { href, label } = !handle && link.signedOut ? link.signedOut : link;
		return { href: href.replace('{handle}', handle || ''), label, wide: 'wide' in link ? link.wide : undefined };
	});
}
