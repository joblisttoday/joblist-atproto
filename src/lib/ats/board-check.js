import { getJobs } from './index.js';
import { getJson } from './job.js';

/**
 * The company name a job board gives, for providers whose public API says it.
 * Others (Ashby, Lever, Personio, Rippling) only know the board id.
 * @type {Record<string, (id: string) => Promise<string | undefined>>}
 */
const namers = {
	greenhouse: async (id) => (await getJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}`))?.name,
	workable: async (id) => (await getJson(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(id)}`))?.name,
	smartrecruiters: async (id) =>
		(await getJson(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings?limit=1`))?.content?.[0]
			?.company?.name,
	recruitee: async (id) => (await getJson(`https://${encodeURIComponent(id)}.recruitee.com/api/offers`))?.offers?.[0]?.company_name
};

/**
 * @param {{provider: string, id: string}} board
 * @returns {Promise<string>}
 */
export async function boardName({ provider, id }) {
	try {
		return String((await namers[provider]?.(id)) || '').trim();
	} catch {
		return '';
	}
}

/**
 * Whether a job board is live: its open jobs, and the name it gives the company.
 * @param {{provider: string, id: string}} board
 */
export async function checkBoard(board) {
	const company = /** @type {import('#lib/models/company.js').Company} */ (
		/** @type {unknown} */ ({ key: '', jobBoard: board })
	);
	const [jobs, name] = await Promise.all([getJobs(company), boardName(board)]);
	return { count: jobs.length, name };
}
