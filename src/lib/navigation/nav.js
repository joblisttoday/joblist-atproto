import links from '#lib/data/nav.json';

/**
 * A row of the menu (/menu): a place (href) or an action (onclick), its icon and label,
 * its current value (small), external when it leaves joblist.
 * @typedef {{href?: string, onclick?: () => void, icon: import('#lib/icons.js').IconName, label: string, value?: string, external?: boolean}} MenuLink
 */

/**
 * The main navigation, the same on every screen: Home, Explore (jobs, organizations, lists),
 * Me (what one keeps, the account with its picture), and the menu (settings, about).
 * badge: the count it shows ("saved": the new jobs of the saved searches).
 * within: the paths it is the tab of, besides its own (Explore: every job, organization and list, and adding one).
 * account: the tab that shows the signed-in account (its picture).
 * @returns {{href: string, label: string, icon: import('#lib/icons.js').IconName, badge?: string, account?: boolean, within: string[]}[]}
 */
export function navLinks() {
	return links.map((link) => {
		const { href, label, icon } = link;
		return {
			href,
			label,
			icon: /** @type {import('#lib/icons.js').IconName} */ (icon),
			badge: 'badge' in link ? link.badge : undefined,
			account: ('account' in link && link.account) || undefined,
			within: ('within' in link && link.within) || []
		};
	});
}
