/**
 * The bot's weekly post, from the trends file (indexer/stats.js): how many jobs are
 * new, how many are open, where and in which fields, and a link to /stats. Counts,
 * city and field names only: it never names a company or a person, never mentions anyone.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { change, percent, readStats } from '../src/lib/models/stats.js';
import { t } from '../worker/text.js';

/**
 * @typedef {{text: string, facets: object[], embed: object, tags: string[]}} Post
 *   As an app.bsky.feed.post record wants it (without $type, createdAt, langs).
 */

const encoder = new TextEncoder();
const locale = config.defaultLocale;

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
 * The week's post: null when the file says nothing.
 * @param {unknown} data stats.json
 * @returns {Post | null}
 */
export function weeklyPost(data) {
	const stats = readStats(data);
	if (!stats || !stats.now.open) return null;
	const { now } = stats;
	const n = (/** @type {number} */ value) => value.toLocaleString(locale);
	const growth = change(now.newWeek, now.newWeekBefore);
	const counts = { count: n(now.newWeek), open: n(now.open), companies: n(now.companies) };
	const lines = [
		growth === null
			? t('bot.week.first', counts)
			: t('bot.week', { ...counts, change: t(growth >= 0 ? 'bot.up' : 'bot.down', { percent: percent(Math.abs(growth), locale) }) }),
		t('bot.cities', { list: now.cities.slice(0, config.bot.shown).map((c) => `${cleanName(c.name)} ${n(c.open)}`).join(', ') }),
		t('bot.fields', { list: now.fields.slice(0, config.bot.shown).map((f) => t(`field.${f.slug}`)).join(', ') })
	];
	const url = `${config.url}/stats`;
	const before = `${lines.join('\n')}\n\n${t('bot.more')} `;
	const shown = url.replace(/^https?:\/\//, '');
	const byteStart = encoder.encode(before).length;
	return {
		text: before + shown,
		facets: [{ index: { byteStart, byteEnd: byteStart + encoder.encode(shown).length }, features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }] }],
		embed: { $type: 'app.bsky.embed.external', external: { uri: url, title: `${t('stats.title')} · ${config.name}`, description: t('stats.intro') } },
		tags: [config.bot.tag]
	};
}
