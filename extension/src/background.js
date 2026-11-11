import { badgeOf, glanceOf } from '../../src/lib/models/glance.js';
import { api } from './api.js';
import { counts } from './counts.js';
import { keptNow } from './store.js';
import { t } from './texts.js';

/**
 * The button, at a glance of each tab's website: its open jobs on joblist, ✓ when joblist
 * knows it, ★ when it is only kept here, nothing else. Decided here, from joblist's counts
 * and the organizations kept: the site open is never sent anywhere.
 */

/** @param {{id?: number, url?: string}} tab */
async function show(tab) {
	if (tab.id === undefined || tab.id < 0) return;
	const glance = tab.url ? glanceOf(tab.url, await counts(), await keptNow()) : null;
	const badge = badgeOf(glance);
	await api.action.setBadgeText({ tabId: tab.id, text: badge.text }).catch(() => {});
	if (badge.color) await api.action.setBadgeBackgroundColor({ tabId: tab.id, color: badge.color }).catch(() => {});
	const title = !glance
		? 'joblist'
		: glance.jobs
			? t('glance.jobs', { count: glance.jobs })
			: glance.known
				? t('glance.known')
				: glance.saved
					? t('glance.saved')
					: t('glance.none');
	await api.action.setTitle({ tabId: tab.id, title }).catch(() => {});
}

async function showActive() {
	const tabs = await api.tabs.query({ active: true });
	for (const tab of tabs) await show(tab);
}

api.tabs.onUpdated.addListener((/** @type {number} */ _id, /** @type {any} */ change, /** @type {any} */ tab) => {
	if (change.url || change.status === 'complete') show(tab);
});
api.tabs.onActivated.addListener((/** @type {{tabId: number}} */ { tabId }) => api.tabs.get(tabId).then(show).catch(() => {}));
// Kept or forgotten in the popup, or joblist.today's list copied: the button follows.
api.storage.onChanged.addListener((/** @type {any} */ changes) => {
	if (changes.changes || changes.mirror || changes.counts) showActive();
});
api.runtime.onStartup?.addListener(showActive);
api.runtime.onInstalled?.addListener(showActive);
showActive();
