import config from '#lib/data/config.json';
import { putRecord } from '#lib/atproto/write.js';
import { session } from '#lib/auth/session.svelte.js';
import { copyRecord } from '#lib/models/company.js';
import { upsertLocal } from './network.svelte.js';

/**
 * Save a version's content as the signed-in person's own version, with a new
 * edit time, so it becomes the one shown: restoring an older version, or
 * confirming one the crawler added.
 * @param {import('#lib/models/company.js').Company} company
 * @param {import('#lib/atproto/records.js').RepoRecord} version
 */
export async function saveVersion(company, version) {
	const own = company.versions.find((v) => v.did === session.did);
	const record = copyRecord(version.value, own?.value.createdAt);
	const res = await putRecord(config.collections.company, company.key, record);
	upsertLocal('company', {
		did: /** @type {string} */ (session.did),
		rkey: company.key,
		uri: res.uri,
		cid: res.cid,
		value: record
	});
}
