/**
 * Health of one company: does the website answer, does the job board answer
 * (and with how many open jobs), does the careers page answer.
 * Shared by check-companies.js and crawl.js.
 */
import { toDomain } from '../../src/lib/models/company.js';
import { checkBoard } from './boards.js';
import { probe } from './http.js';
import { siteOf } from './match.js';

const PARKED = /(^|\.)(hugedomains|sedo|dan|afternic|parkingcrew|bodis|undeveloped|godaddy)\.(com|net|org)$/;

/**
 * A page check, with where it ended up when it moved to another domain.
 * @param {string} url
 */
export async function checkPage(url) {
	let page = await probe(url);
	if (page.state === 'unreachable') {
		// Some sites answer only with (or only without) www.
		const other = new URL(url);
		other.hostname = other.hostname.startsWith('www.') ? other.hostname.slice(4) : `www.${other.hostname}`;
		const retry = await probe(other.href);
		if (retry.state !== 'unreachable') page = { ...retry, url };
	}
	const from = toDomain(url);
	const to = page.finalUrl ? toDomain(page.finalUrl) : '';
	/** @type {Record<string, any>} */
	const result = { url, state: page.state };
	if (page.status) result.status = page.status;
	if (page.error) result.error = page.error;
	if (to && siteOf(to) !== siteOf(from)) result.redirectedTo = to;
	if (to && PARKED.test(to)) result.state = 'parked';
	return result;
}

/** @param {{uri: string, did: string, rkey: string, value: Record<string, any>}} record */
export async function checkCompany(record) {
	const v = record.value;
	const [website, board, careers] = await Promise.all([
		v.url ? checkPage(v.url) : null,
		v.jobBoard?.provider && v.jobBoard?.id ? checkBoard(v.jobBoard) : null,
		v.jobBoard?.url ? checkPage(v.jobBoard.url) : null
	]);
	return { uri: record.uri, did: record.did, rkey: record.rkey, name: v.name, website, board, careers };
}

/** @param {any[]} items @param {(x: any) => string} key */
function countBy(items, key) {
	/** @type {Record<string, number>} */
	const counts = {};
	for (const item of items) counts[key(item)] = (counts[key(item)] || 0) + 1;
	return counts;
}

/** @param {any[]} companies health checks */
export function summarize(companies) {
	const websites = companies.filter((c) => c.website);
	const boards = companies.filter((c) => c.board);
	const careers = companies.filter((c) => c.careers);
	return {
		companies: companies.length,
		website: {
			none: companies.length - websites.length,
			...countBy(websites, (c) => c.website.state),
			redirectedToOtherDomain: websites.filter((c) => c.website.state === 'ok' && c.website.redirectedTo).length
		},
		board: {
			none: companies.length - boards.length,
			...countBy(boards, (c) => c.board.state),
			openJobs: boards.reduce((sum, c) => sum + (c.board.jobs || 0), 0),
			byProvider: Object.fromEntries(
				Object.entries(countBy(boards, (c) => c.board.provider)).map(([provider]) => [
					provider,
					countBy(boards.filter((c) => c.board.provider === provider), (c) => c.board.state)
				])
			)
		},
		careersPage: countBy(careers, (c) => c.careers.state)
	};
}
