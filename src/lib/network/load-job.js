import config from '#lib/data/config.json';
import { getRecord } from '#lib/atproto/records.js';

/**
 * Read one job offer straight from its poster's server, for offers the
 * relay has not indexed yet (or links opened before the network loaded).
 * @param {string} did
 * @param {string} rkey
 */
export function loadJob(did, rkey) {
	return getRecord(did, config.collections.job, rkey);
}
