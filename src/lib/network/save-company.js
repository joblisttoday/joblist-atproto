import config from '#lib/data/config.json';
import { putRecord } from '#lib/atproto/write.js';
import { session } from '#lib/auth/session.svelte.js';
import { companyRecord } from '#lib/models/company-form.js';
import { upsertLocal } from './network.svelte.js';

/**
 * Write a company record as the signed-in person's own version (the record
 * key is the domain), and show it at once.
 * @param {string} key
 * @param {Record<string, any>} record
 */
export async function putCompany(key, record) {
	const res = await putRecord(config.collections.company, key, record);
	upsertLocal('company', {
		did: /** @type {string} */ (session.did),
		rkey: key,
		uri: res.uri,
		cid: res.cid,
		value: record
	});
}

/**
 * Save the company form as the signed-in person's own version.
 * @param {import('#lib/models/company.js').CompanyForm} form
 * @param {import('#lib/models/company.js').Company | null} company the company edited, or null for a new one
 * @returns {Promise<string>} the company's key
 */
export async function saveCompany(form, company) {
	const { key, record } = companyRecord(form, company, /** @type {string} */ (session.did));
	await putCompany(key, record);
	return key;
}
