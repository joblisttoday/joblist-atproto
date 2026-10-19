import config from '#lib/data/config.json';
import { createRecord, deleteRecord, putRecord } from '#lib/atproto/write.js';
import { tid } from '#lib/atproto/tid.js';
import { session } from '#lib/auth/session.svelte.js';
import { postPageUrl, renewed, toRecord } from '#lib/models/job-post.js';
import { removeLocal, upsertLocal } from './network.svelte.js';

/**
 * Job offers in the signed-in person's own account. Only the offer is
 * written: applications go to the poster, never through joblist.
 * @typedef {import('#lib/models/job-post.js').JobPost} JobPost
 * @typedef {import('#lib/models/job-post.js').JobForm} JobForm
 */

const collection = config.collections.job;

/**
 * @param {string} rkey
 * @param {Record<string, any>} record
 * @param {{uri: string, cid: string}} res
 */
function keep(rkey, record, res) {
	upsertLocal('job', { did: /** @type {string} */ (session.did), rkey, uri: res.uri, cid: res.cid, value: record });
}

/**
 * Post a new offer. Its key is made first, so the record can link to its own page.
 * @param {JobForm} form
 * @returns {Promise<string>} the new record key
 */
export async function postJob(form) {
	const did = /** @type {string} */ (session.did);
	const rkey = tid();
	const record = toRecord(form, { page: postPageUrl({ did, rkey }) });
	keep(rkey, record, await createRecord(collection, record, rkey));
	return rkey;
}

/**
 * Save changes to one of the signed-in person's offers.
 * @param {JobPost} post
 * @param {JobForm} form
 */
export async function updateJob(post, form) {
	const record = toRecord(form, { page: postPageUrl(post), createdAt: post.createdAt });
	keep(post.rkey, record, await putRecord(collection, post.rkey, record));
}

/**
 * Show an offer again for the default time, from now.
 * @param {JobPost} post
 */
export async function renewJob(post) {
	const record = renewed(post.record.value);
	keep(post.rkey, record, await putRecord(collection, post.rkey, record));
}

/** @param {JobPost} post */
export async function deleteJob(post) {
	await deleteRecord(collection, post.rkey);
	removeLocal('job', post.uri);
}
