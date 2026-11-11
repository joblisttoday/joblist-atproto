import { keyOf } from '#lib/models/kept.js';
import { kept } from './kept.svelte.js';

/**
 * What the search box looks through: the organizations saved in this browser, by their
 * name or tags (no list of every organization: a link or a domain opens any other).
 */
const companies = $derived(
	kept.list.map((k) => {
		const key = keyOf(k.url);
		const name = k.name || k.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
		return { key: key || k.url, name, tags: k.tags || [], href: key ? `/${key}` : `/me/organization#${new URLSearchParams({ url: k.url })}` };
	})
);

export const sources = {
	get companies() {
		return companies;
	},
	places: /** @type {[string, number][]} */ ([]),
	counts: /** @type {Map<string, number>} */ (new Map())
};
