import links from '#lib/data/nav.json';

/**
 * A row of the menu (/menu): a place (href) or an action (onclick), its icon and label,
 * its current value (small), external when it leaves joblist.
 * @typedef {{href?: string, onclick?: () => void, icon: import('#lib/icons.js').IconName, label: string, value?: string, external?: boolean}} MenuLink
 */

/**
 * The main navigation: the places to go, then the menu (/menu: the account, what to make,
 * this browser's settings), with the signed-in account's picture.
 * wide: only on wide screens, where there is room (phones keep five tabs).
 * badge: the count it shows ("saved": the new jobs of the saved searches).
 * account: the tab that shows the signed-in account (its picture).
 * @returns {{href: string, label: string, icon: import('#lib/icons.js').IconName, wide?: boolean, badge?: string, account?: boolean}[]}
 */
export function navLinks() {
	return links.map((link) => {
		const { href, label, icon } = link;
		return {
			href,
			label,
			icon: /** @type {import('#lib/icons.js').IconName} */ (icon),
			wide: 'wide' in link ? link.wide : undefined,
			badge: 'badge' in link ? link.badge : undefined,
			account: ('account' in link && link.account) || undefined
		};
	});
}
