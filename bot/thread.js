/**
 * The daily thread of the bot, from the digest the indexer writes (indexer/digest.js):
 * a first post with how many jobs are new, then one reply per city, each linking to
 * its page here with its hashtag. Counts, place and field names only: it never
 * names a company or a person, and never mentions anyone.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { landingPath } from '../src/lib/models/landing.js';
import { fieldName, pageTitle, t } from '../worker/text.js';

/**
 * @typedef {{text: string, facets: object[], embed?: object, tags?: string[]}} Post
 *   As an app.bsky.feed.post record wants them (without $type, createdAt, langs, reply).
 * @typedef {string | {text: string, link: string} | {text: string, tag: string}} Part
 */

const encoder = new TextEncoder();
/** The address shown in a post: joblist.today/in/berlin. */
const shown = (/** @type {string} */ url) => url.replace(/^https?:\/\//, '');

/**
 * Text with its links and hashtags as facets (positions in UTF-8 bytes).
 * @param {Part[]} parts
 * @returns {{text: string, facets: object[]}}
 */
export function richText(parts) {
	let text = '';
	const facets = [];
	for (const part of parts) {
		if (typeof part === 'string') {
			text += part;
			continue;
		}
		const byteStart = encoder.encode(text).length;
		text += part.text;
		const byteEnd = encoder.encode(text).length;
		const feature = 'link' in part ? { $type: 'app.bsky.richtext.facet#link', uri: part.link } : { $type: 'app.bsky.richtext.facet#tag', tag: part.tag };
		facets.push({ index: { byteStart, byteEnd }, features: [feature] });
	}
	return { text, facets };
}

/**
 * A city's name as said in a post: letters, digits, spaces and a few marks only
 * (names come from job boards: nothing in them can become a mention or a link).
 * @param {unknown} name
 */
export function cleanName(name) {
	return String(name ?? '')
		.replace(/[^\p{L}\p{M}\p{N} .'’-]/gu, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, config.landing.slugMax);
}

/**
 * A city's hashtag: "São Paulo" → SãoPauloJobs; '' when nothing is left.
 * @param {string} name
 */
export function cityTag(name) {
	const words = name.split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
	return words.length ? t('bot.tag', { city: words.map((w) => w[0].toUpperCase() + w.slice(1)).join('') }) : '';
}

/**
 * The thread: none when no city had enough new jobs.
 * @param {import('../indexer/digest.js').Digest} digest
 * @returns {Post[]}
 */
export function threadPosts(digest) {
	const cities = (Array.isArray(digest?.cities) ? digest.cities : []).filter((c) => c && typeof c.slug === 'string' && Number(c.count) > 0);
	if (!cities.length) return [];
	const total = Number(digest.total) || 0;
	const first = richText([t('bot.root', { count: total, hours: Number(digest.hours) || config.bot.hours }), '\n\n', { text: shown(config.url), link: config.url }]);
	/** @type {Post[]} */
	const posts = [{ ...first, tags: [config.bot.tag] }];
	for (const city of cities) {
		const name = cleanName(city.name) || city.slug;
		const url = config.url + landingPath({ city: city.slug });
		const fields = (city.fields || []).map((f) => t('bot.field', { field: fieldName({ field: f.slug }), count: Number(f.count) || 0 }));
		const tag = cityTag(name);
		/** @type {Part[]} */
		const parts = [t('bot.city', { city: name, count: Number(city.count) || 0 })];
		if (fields.length) parts.push('\n', t('bot.fields', { fields: fields.join(', ') }));
		parts.push('\n\n', { text: shown(url), link: url });
		if (tag) parts.push(' ', { text: `#${tag}`, tag });
		posts.push({
			...richText(parts),
			embed: { $type: 'app.bsky.embed.external', external: { uri: url, title: `${pageTitle({ city: city.slug }, name)} · ${config.name}`, description: '' } }
		});
	}
	return posts;
}
