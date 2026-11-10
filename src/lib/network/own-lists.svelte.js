import { ownLists } from '#lib/models/own-lists.js';
import { LOCAL } from '#lib/models/list.js';
import { kept } from './job-collections.svelte.js';
import { data, handleOf, ownsList } from './network.svelte.js';

/** The current profile's lists, of jobs and of organizations (models/own-lists.js). */
const rows = $derived(
	ownLists(
		kept.state.collections,
		data.lists.filter(ownsList),
		(l) => `/${handleOf(l.did)}/${l.rkey}`,
		(l) => l.did !== LOCAL
	)
);

export const own = {
	get lists() {
		return rows;
	}
};
