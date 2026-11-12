import { applyChanges, listsToKept, readKept } from '../../src/lib/models/kept.js';
import { api } from './api.js';

/**
 * On joblist.today: the add-on's changes made to the list the site keeps (in its own storage,
 * this page's), the site told ("joblist:kept"), and the add-on's copy of the list made the same.
 * Each change the site makes (it says "joblist:kept-written") is copied too, and its saved
 * searches ("joblist:searches-written"), for the popup to count the jobs matching them.
 * Nothing is sent anywhere.
 */
const KEY = 'joblist.kept.v1';

/** The site's list; the first time, the organizations of its private lists before. */
function siteList() {
	try {
		const text = localStorage.getItem(KEY);
		if (text !== null) return readKept(JSON.parse(text));
		return listsToKept(JSON.parse(localStorage.getItem('joblist.lists.v1') || '[]'));
	} catch {
		return [];
	}
}

async function sync() {
	const { changes = [] } = await api.storage.local.get('changes');
	const made = Array.isArray(changes) ? changes : [];
	const list = applyChanges(siteList(), made);
	if (made.length) {
		localStorage.setItem(KEY, JSON.stringify(list));
		dispatchEvent(new CustomEvent('joblist:kept'));
	}
	// Changes made while this ran stay, for the next time.
	const { changes: now = [] } = await api.storage.local.get('changes');
	await api.storage.local.set({ mirror: list, searches: siteSearches(), changes: Array.isArray(now) ? now.slice(made.length) : [] });
}

/** The site's saved searches (src/lib/network/saved-searches.svelte.js). */
function siteSearches() {
	try {
		const list = JSON.parse(localStorage.getItem('joblist.searches.v1') || '[]');
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}

sync();
api.runtime.onMessage.addListener((/** @type {any} */ message) => {
	if (message?.joblist === 'sync') sync();
});
addEventListener('joblist:kept-written', () => api.storage.local.set({ mirror: siteList() }));
addEventListener('joblist:searches-written', () => api.storage.local.set({ searches: siteSearches() }));
