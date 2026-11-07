import config from '#lib/data/config.json';

/**
 * The trends file of the snapshot (indexer/stats.js), read once.
 * @type {Promise<any> | null}
 */
let promise = null;

/** @returns {Promise<any>} null when missing or unreadable */
export function getStats() {
	promise ??= fetch(`${config.snapshot.path}/${config.stats.file}`)
		.then((res) => (res.ok ? res.json() : null))
		.catch(() => null);
	return promise;
}
