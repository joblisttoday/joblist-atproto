import { session } from '#lib/auth/session.svelte.js';
import { copyRecord } from '#lib/models/company.js';
import { putCompany } from './save-company.js';

/**
 * Save a version's content as the signed-in person's own version, with a new
 * edit time, so it becomes the one shown: restoring an older version, or
 * confirming one the crawler added.
 * @param {import('#lib/models/company.js').Company} company
 * @param {import('#lib/atproto/records.js').RepoRecord} version
 */
export async function saveVersion(company, version) {
	const own = company.versions.find((v) => v.did === session.did);
	await putCompany(company.key, copyRecord(version.value, own?.value.createdAt));
}
