/**
 * The feed of any explorer search (/feed/search.xml?q=design&where=Lisbon): the jobs
 * first seen in the last hours (config.searchFeed) that it finds, matched as the
 * explorer matches them. Searches stay in their address: nothing is stored.
 *
 * It reads one small file of recent jobs (indexer/landing.js), never jobs.json:
 * a Worker on the free plan has a few milliseconds of CPU per request.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { filterJobs } from '../src/lib/models/job.js';
import { feedPath } from '../src/lib/models/landing.js';
import { fromParams } from '../src/lib/models/saved-search.js';
import { fromSnapshot } from '../src/lib/models/snapshot-job.js';
import { atom } from './feed.js';
import { t } from './text.js';

/**
 * The rows of a snapshot file a search finds, in their order.
 * @param {any[]} rows as in landing/recent.json
 * @param {Record<string, string>} names company names by key
 * @param {import('../src/lib/models/job.js').JobFilters} filters
 */
export function matching(rows, names, filters) {
	/** @type {Map<object, any>} */
	const rowOf = new Map();
	for (const row of rows) {
		const job = row && typeof row === 'object' ? fromSnapshot(row) : null;
		if (job) rowOf.set(job, row);
	}
	return filterJobs([...rowOf.keys()], filters, new Map(Object.entries(names))).map((job) => rowOf.get(job));
}

/**
 * What a search is, in words: "design · Lisbon · Remote".
 * @param {import('../src/lib/models/job.js').JobFilters} filters
 */
export function searchLabel({ query, where, remote, pay }) {
	return [query.trim(), where.trim(), remote && t(`jobs.filter.workplace.${remote}`), pay && t('jobs.filter.pay')].filter(Boolean).join(' · ');
}

/**
 * @param {string} search the address query, checked (routes.js withPage)
 * @param {any} data landing/recent.json
 */
export function searchFeed(search, data) {
	const filters = fromParams(new URLSearchParams(search));
	const names = data?.names && typeof data.names === 'object' ? data.names : {};
	const rows = Array.isArray(data?.jobs) ? data.jobs : [];
	return atom({
		title: `${t('feed.search.title', { search: searchLabel(filters) })} · ${config.name}`,
		subtitle: t('feed.search.intro', { hours: config.searchFeed.hours }),
		path: feedPath({ search }),
		page: `/${search}`,
		jobs: matching(rows, names, filters),
		names,
		generatedAt: data?.generatedAt
	});
}
