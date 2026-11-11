import config from '../../src/lib/data/config.json' with { type: 'json' };
import { applyChanges, readKept } from '../../src/lib/models/kept.js';
import { api } from './api.js';

/**
 * The organizations kept, as the add-on knows them: a copy of joblist.today's list (mirror,
 * brought by sync.js when the site is open), and the changes made here since (changes), made
 * there at the next visit. What the popup shows is the copy with the changes made.
 * Nothing leaves this browser.
 * @typedef {import('../../src/lib/models/kept.js').Kept} Kept
 * @typedef {import('../../src/lib/models/kept.js').Change} Change
 */

/** @returns {Promise<{mirror: Kept[], changes: Change[]}>} */
export async function load() {
	const { mirror, changes } = await api.storage.local.get(['mirror', 'changes']);
	return { mirror: readKept(mirror), changes: Array.isArray(changes) ? changes : [] };
}

/** The organizations kept, with the changes not yet made on joblist.today. */
export async function keptNow() {
	const { mirror, changes } = await load();
	return applyChanges(mirror, changes);
}

/** A change, kept until joblist.today is open; an open joblist.today makes it now. @param {Change} change */
export async function change(change) {
	const { changes } = await load();
	await api.storage.local.set({ changes: [...changes, change] });
	try {
		const tabs = await api.tabs.query({ url: `${config.url}/*` });
		for (const tab of tabs) api.tabs.sendMessage(tab.id, { joblist: 'sync' }).catch(() => {});
	} catch {
		// no open joblist.today: at the next visit
	}
}
