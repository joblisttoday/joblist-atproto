import links from '#lib/data/nav.json';

/**
 * A row of the menu (/menu): a place (href) or an action (onclick), its icon and label,
 * its current value (small), external when it leaves joblist.
 *   chips: what it holds, each a chip under it (the Account row: this device and each account, the one in use ok).
 * @typedef {{href?: string, onclick?: () => void, icon: import('#lib/icons.js').IconName, label: string, value?: string, external?: boolean, chips?: {text: string, tone?: 'new' | 'ok' | 'warn'}[]}} MenuLink
 */

/**
 * The job seeker's navigation (nav.json): Explore (the home: the search, and the
 * organizations you follow), Jobs (theirs), Saved (your lists of jobs), Menu. An
 * organization's, in /org, is made in Nav.svelte (docs/architecture.md).
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
			account: 'account' in link && link.account === true ? true : undefined,
			within: ('within' in link && link.within) || []
		};
	});
}
