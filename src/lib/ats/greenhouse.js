import { getJson } from './job.js';
import { htmlToText, unescapeHtml } from './text.js';
import { oneRange, toSalary } from './salary.js';

/** @type {import('./index.js').Fetcher} */
export default async function greenhouse(id) {
	const board = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}`;
	// Departments come with the jobs' whole texts only (ten times as much): from their own list instead.
	const [data, departments] = await Promise.all([getJson(`${board}/jobs?pay_transparency=true`), getJson(`${board}/departments`)]);
	const departmentOf = departmentsByJob(departments);
	return (data?.jobs || []).map((/** @type {any} */ j) => ({
		id: String(j.id),
		title: j.title,
		url: j.absolute_url,
		location: j.location?.name,
		department: departmentOf.get(String(j.id)),
		published: j.first_published || j.updated_at,
		salary: oneRange((j.pay_input_ranges || []).map(payRange))
	}));
}

/**
 * Each job's department, from a board's departments (a job is listed in its own one).
 * @param {any} data
 * @returns {Map<string, string>} job id → department name
 */
export function departmentsByJob(data) {
	/** @type {Map<string, string>} */
	const by = new Map();
	for (const d of data?.departments || []) {
		const name = String(d?.name || '').trim();
		if (!name || name === 'No Department') continue;
		for (const job of d.jobs || []) if (!by.has(String(job.id))) by.set(String(job.id), name);
	}
	return by;
}

const notBase = /variable|bonus|commission|equity/i;

/**
 * One of a job's pay ranges (Greenhouse's pay transparency), in cents and without a
 * period: the period is read from its title and text ("Hourly Pay", "the expected
 * hourly rate"), else it is a year. An amount that cannot be for that period is left out.
 * @param {any} range
 */
export function payRange(range) {
	if (notBase.test(range?.title || '')) return undefined;
	const words = `${range.title || ''} ${htmlToText(range.blurb)}`;
	const max = Math.max(Number(range.min_cents) || 0, Number(range.max_cents) || 0) / 100;
	const hourly = /\bhour(ly)?\b/i.test(words) && max < 1000;
	const monthly = /\bmonth(ly)?\b/i.test(words) && !/\bannual|\byear/i.test(words);
	const period = hourly ? 'hour' : monthly ? 'month' : max >= 1000 ? 'year' : '';
	return toSalary({ min: Number(range.min_cents) / 100, max: Number(range.max_cents) / 100, currency: range.currency_type, period });
}

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const job = await getJson(
		`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}/jobs/${encodeURIComponent(jobId)}`
	);
	return htmlToText(unescapeHtml(job?.content));
}
