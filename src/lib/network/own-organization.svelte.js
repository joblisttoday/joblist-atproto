import { session } from '#lib/auth/session.svelte.js';
import { ownDomain } from '#lib/models/company.js';
import { missingFields } from '#lib/models/company-form.js';
import { data } from './network.svelte.js';
import { outbox } from './outbox.svelte.js';

/**
 * The organization signed in here (its domain is the account's handle), as its dashboard
 * (/org and its pages) shows it: its record, its job offers, its board, what its
 * page lacks, what waits to be sent.
 */
const own = $derived(ownDomain(session.handle));
const company = $derived(own ? data.companies.get(own) : undefined);
const posts = $derived(session.did ? data.posts.filter((p) => p.did === session.did) : []);
const board = $derived(company?.jobBoard?.provider && company.jobBoard.id ? { provider: company.jobBoard.provider, id: company.jobBoard.id } : null);
const missing = $derived(company ? missingFields(company) : []);
const waiting = $derived(outbox.entries.filter((e) => e.did === session.did).length);

export const ownOrganization = {
	/** Its domain, '' when the account signed in is no organization's. */
	get own() {
		return own;
	},
	get company() {
		return company;
	},
	get posts() {
		return posts;
	},
	get board() {
		return board;
	},
	get missing() {
		return missing;
	},
	get waiting() {
		return waiting;
	}
};
