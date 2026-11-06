import links from '#lib/data/nav.json';

/**
 * The main navigation for the current session ("Me" is the signed-in person's profile).
 * wide: only on wide screens, where there is room (phones keep five tabs).
 * badge: the count it shows ("saved": the new jobs of the saved searches).
 * @param {string | null} handle the signed-in handle, null when signed out
 * @returns {{href: string, label: string, icon: import('#lib/icons.js').IconName, wide?: boolean, badge?: string}[]}
 */
export function navLinks(handle) {
	return links.map((link) => {
		const { href, label, icon } = !handle && link.signedOut ? link.signedOut : link;
		return {
			href: href.replace('{handle}', handle || ''),
			label,
			icon: /** @type {import('#lib/icons.js').IconName} */ (icon),
			wide: 'wide' in link ? link.wide : undefined,
			badge: 'badge' in link ? link.badge : undefined
		};
	});
}
