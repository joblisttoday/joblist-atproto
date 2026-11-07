import { getJson } from './job.js';
import { htmlToText, unescapeHtml } from './text.js';
import { oneRange, toSalary } from './salary.js';

/** @type {import('./index.js').Fetcher} */
export default async function greenhouse(id) {
	const data = await getJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}/jobs?pay_transparency=true`);
	return (data?.jobs || []).map((/** @type {any} */ j) => ({
		id: String(j.id),
		title: j.title,
		url: j.absolute_url,
		location: j.location?.name,
		published: j.first_published || j.updated_at,
		salary: oneRange((j.pay_input_ranges || []).map(payRange))
	}));
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
