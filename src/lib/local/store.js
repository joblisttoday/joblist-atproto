import { createStore, get, set } from 'idb-keyval';

/**
 * joblist's own database in this browser (IndexedDB, through idb-keyval): one value per
 * key, as large as the browser allows (localStorage stops at about 5 MB). Blocked or
 * full (a private window, cleared site data): reads give undefined and writes nothing,
 * and the app works without it.
 */
/** @type {ReturnType<typeof createStore> | undefined} */
let store;
const db = () => (store ??= createStore('joblist', 'kept'));

/** @param {string} key */
export async function readKept(key) {
	try {
		return await get(key, db());
	} catch {
		return undefined;
	}
}

/**
 * @param {string} key
 * @param {unknown} value plain data (a $state is passed as $state.snapshot)
 */
export async function keep(key, value) {
	try {
		await set(key, value, db());
	} catch {
		// blocked or full: kept for this visit only
	}
}
