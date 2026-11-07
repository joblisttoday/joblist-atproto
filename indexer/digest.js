/**
 * What the bot posts once a day (bot/index.js): how many jobs were first seen in
 * the last hours (config.bot.hours), and the cities with a page that had the most,
 * with their fields that had the most. Counts and place names only: no company,
 * no person is ever named.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };

/**
 * @typedef {import('./jobs.js').IndexedJob} IndexedJob
 * @typedef {{generatedAt: string, hours: number, total: number, cities: {slug: string, name: string, count: number, fields: {slug: string, count: number}[]}[]}} Digest
 */

/**
 * @param {{sorted: IndexedJob[], groups: Map<string, IndexedJob[]>, cities: string[], pairs: {city: string, field: string}[], cityName: (slug: string) => string, generatedAt: string}} found
 *   sorted: every job newest first; groups: by "in/city" and "in/city/field", newest first;
 *   cities and pairs: those with a page
 * @returns {Digest}
 */
export function digestFile({ sorted, groups, cities, pairs, cityName, generatedAt }) {
	const { hours, minJobs, cities: most, fields: fieldsShown } = config.bot;
	const since = Date.parse(generatedAt) - hours * 36e5;
	/** Jobs newest first: count until the first older one. @param {IndexedJob[] | undefined} jobs */
	const fresh = (jobs = []) => {
		let n = 0;
		while (n < jobs.length && Date.parse(jobs[n].p || '') >= since) n++;
		return n;
	};
	const found = cities
		.map((slug) => ({
			slug,
			name: cityName(slug),
			count: fresh(groups.get(`in/${slug}`)),
			fields: pairs
				.filter((p) => p.city === slug)
				.map(({ field }) => ({ slug: field, count: fresh(groups.get(`in/${slug}/${field}`)) }))
				.filter((f) => f.count > 0)
				.sort((a, b) => b.count - a.count)
				.slice(0, fieldsShown)
		}))
		.filter((c) => c.count >= minJobs)
		.sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
		.slice(0, most);
	return { generatedAt, hours, total: fresh(sorted), cities: found };
}
