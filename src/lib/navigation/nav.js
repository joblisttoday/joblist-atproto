import links from '#lib/data/nav.json';

/**
 * A row of the menu (/menu): a place (href) or an action (onclick), its icon and label,
 * its current value (small), external when it leaves joblist.
 * @typedef {{href?: string, onclick?: () => void, icon: import('#lib/icons.js').IconName, label: string, value?: string, external?: boolean}} MenuLink
 */

/**
 * The main navigation, the same on every screen: Home (the search, what this browser keeps),
 * Jobs (of the saved organizations), and the Menu (the account with its picture, settings).
 * badge: the count it shows ("saved": the new jobs of the saved searches).
 * within: the paths it is the tab of, besides its own (Explore: every job, organization and list, and adding one).
 * account: the tab that shows the signed-in account (its picture).
 * saved: shown only once an organization is saved (before, there is nothing to show there).
 * @returns {{href: string, label: string, icon: import('#lib/icons.js').IconName, badge?: string, account?: boolean, saved?: boolean, within: string[]}[]}
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
			saved: ('saved' in link && link.saved) || undefined,
			within: ('within' in link && link.within) || []
		};
	});
}
