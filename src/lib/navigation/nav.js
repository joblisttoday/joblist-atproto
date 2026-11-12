import links from '#lib/data/nav.json';

/**
 * A row of the menu (/menu): a place (href) or an action (onclick), its icon and label,
 * its current value (small), external when it leaves joblist.
 *   chips: what it holds, each a chip under it (the Account row: this device and each account, the one in use ok).
 * @typedef {{href?: string, onclick?: () => void, icon: import('#lib/icons.js').IconName, label: string, value?: string, external?: boolean, chips?: {text: string, tone?: 'new' | 'ok' | 'warn'}[]}} MenuLink
 */

/**
 * The navigation, the same for everyone (nav.json): Home (the search and what is new: a
 * dashboard), Explore (Organizations /companies by tag, Jobs /jobs with your lists), Menu
 * (who you are: your profile, /{domain} or /{name}.local; docs/architecture.md).
 * badge: the count it shows ("saved": the new jobs of the saved searches).
 * within: the paths it is the tab of, besides its own (Explore: every job, organization and list, and adding one).
 * @returns {{href: string, label: string, icon: import('#lib/icons.js').IconName, badge?: string, within: string[]}[]}
 */
export function navLinks() {
	return links.map((link) => {
		const { href, label, icon } = link;
		return {
			href,
			label,
			icon: /** @type {import('#lib/icons.js').IconName} */ (icon),
			badge: 'badge' in link ? link.badge : undefined,
			within: ('within' in link && link.within) || []
		};
	});
}
