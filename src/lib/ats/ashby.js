import { getJson, onceFor, toWorkplace } from './job.js';
import { oneRange, toPeriod, toSalary } from './salary.js';

/** @type {import('./index.js').Fetcher} */
export default async function ashby(id) {
	const data = await board(id);
	return (data?.jobs || [])
		.filter((/** @type {any} */ j) => j.isListed !== false)
		.map((/** @type {any} */ j) => ({
			id: j.id,
			title: j.title,
			url: j.jobUrl,
			location: [j.location, ...(j.secondaryLocations || []).map((/** @type {any} */ l) => l.location)]
				.filter(Boolean)
				.join(', '),
			department: j.department,
			published: j.publishedAt,
			remote: toWorkplace(j.workplaceType) || (j.isRemote ? 'remote' : undefined),
			salary: salary(j)
		}));
}

/**
 * The base pay, when the company shows it on its postings.
 * @param {any} j
 */
function salary(j) {
	if (!j.shouldDisplayCompensationOnJobPostings) return undefined;
	const parts = j.compensation?.summaryComponents || [];
	return oneRange(
		parts
			.filter((/** @type {any} */ c) => c.compensationType === 'Salary')
			.map((/** @type {any} */ c) => toSalary({ min: c.minValue, max: c.maxValue, currency: c.currencyCode, period: toPeriod(c.interval) }))
	);
}

// One read for the jobs and their descriptions, with pay ranges.
const board = onceFor((/** @type {string} */ id) =>
	getJson(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(id)}?includeCompensation=true`)
);

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const job = (await board(id))?.jobs?.find((/** @type {any} */ j) => j.id === jobId);
	return job?.descriptionPlain || '';
}
