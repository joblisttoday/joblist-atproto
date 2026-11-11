import { ownLists } from '#lib/models/own-lists.js';
import { kept } from './job-collections.svelte.js';

/** The current profile's lists of jobs (models/own-lists.js). */
const rows = $derived(ownLists(kept.state.collections));

export const own = {
	get lists() {
		return rows;
	}
};
