import webmcp from '#lib/data/webmcp.json' with { type: 'json' };
import { boardUrl, searchText } from '#lib/models/company.js';
import { filterJobs, newestFirst, workplace } from '#lib/models/job.js';

/**
 * Answers of the read-only WebMCP tools, from data already in the browser.
 * Plain functions of their inputs, so they can be tested without a browser.
 *
 * @typedef {import('#lib/models/company.js').Company} Company
 * @typedef {import('#lib/models/list.js').List} List
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

const limit = webmcp.resultLimit;

/** @param {string} text */
const words = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * @param {Company} company
 * @param {string} origin
 */
export function companySummary(company, origin) {
	return {
		key: company.key,
		name: company.name,
		website: company.url,
		description: company.description,
		tags: company.tags,
		locations: company.locations.map((l) => [l.name, l.country].filter(Boolean).join(', ')).filter(Boolean),
		jobBoard: boardUrl(company.jobBoard) || undefined,
		page: `${origin}/${company.key}`
	};
}

/**
 * @param {Map<string, Company>} companies
 * @param {{query?: string}} args
 * @param {string} origin
 */
export function searchCompanies(companies, { query = '' }, origin) {
	const wanted = words(query);
	const found = [...companies.values()].filter((c) => {
		const text = searchText(c);
		return wanted.every((w) => text.includes(w));
	});
	return { total: found.length, companies: found.slice(0, limit).map((c) => companySummary(c, origin)) };
}

/**
 * @param {Job[]} jobs
 * @param {Map<string, Company>} companies
 * @param {{query?: string, place?: string, remote?: boolean, anywhere?: boolean, pay?: boolean}} args
 */
export function searchJobs(jobs, companies, { query = '', place = '', remote = false, anywhere = false, pay = false }) {
	const names = new Map([...companies.values()].map((c) => [c.key, c.name]));
	// A copy, newest first (filtering keeps the order it is given, and may give the same array).
	const found = [...filterJobs(jobs, { query, where: place, remote: anywhere ? 'anywhere' : remote ? 'remote' : '', pay }, names)];
	newestFirst(found);
	return {
		total: found.length,
		jobs: found.slice(0, limit).map((j) => ({
			title: j.title,
			company: names.get(j.company) || j.company,
			location: j.location,
			workplace: workplace(j),
			salary: j.salary,
			department: j.department,
			published: j.published,
			url: j.url
		}))
	};
}

/**
 * The author (handle or DID) and record key of a list link or at:// URI.
 * @param {string} input
 * @returns {{actor: string, rkey: string} | null}
 */
export function parseListUrl(input) {
	const value = (input || '').trim();
	const at = value.match(/^at:\/\/([^/]+)\/[^/]+\/([^/?#]+)/);
	if (at) return { actor: at[1], rkey: at[2] };
	try {
		const [actor, rkey] = new URL(value).pathname.split('/').filter(Boolean);
		return actor && rkey ? { actor: decodeURIComponent(actor), rkey } : null;
	} catch {
		return null;
	}
}

/**
 * @param {List} list
 * @param {Map<string, Company>} companies
 * @param {string} author
 * @param {string} origin
 */
export function listSummary(list, companies, author, origin) {
	return {
		name: list.name,
		description: list.description,
		author,
		page: `${origin}/${author}/${list.rkey}`,
		companies: list.companies.map((key) => {
			const company = companies.get(key);
			return company ? companySummary(company, origin) : { key, name: key };
		})
	};
}
