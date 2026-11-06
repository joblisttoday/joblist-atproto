import config from '#lib/data/config.json' with { type: 'json' };
import { getJson } from './job.js';
import { htmlToText } from './text.js';

/**
 * Every posting, page by page (the API gives at most 100 at a time),
 * up to the most jobs kept for one board.
 * @param {string} id
 */
async function postings(id) {
	const { boardPageSize: size, jobsPerBoard: most } = config.limits;
	/** @type {any[]} */
	const all = [];
	for (let offset = 0; offset < most; offset += size) {
		const data = await getJson(
			`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings?limit=${size}&offset=${offset}`
		);
		const page = data?.content || [];
		all.push(...page);
		if (page.length < size || all.length >= (data?.totalFound ?? 0)) break;
	}
	return all.slice(0, most);
}

/** @type {import('./index.js').Fetcher} */
export default async function smartrecruiters(id) {
	return (await postings(id)).map((/** @type {any} */ j) => ({
		id: j.id,
		title: j.name,
		url: `https://jobs.smartrecruiters.com/${encodeURIComponent(id)}/${j.id}`,
		location: j.location?.fullLocation,
		department: j.department?.label,
		published: j.releasedDate,
		remote: j.location?.remote ? 'remote' : j.location?.hybrid ? 'hybrid' : 'onsite'
	}));
}

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const job = await getJson(
		`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings/${encodeURIComponent(jobId)}`
	);
	const s = job?.jobAd?.sections || {};
	return [s.jobDescription, s.qualifications, s.additionalInformation, s.companyDescription]
		.filter((x) => x?.text)
		.map((x) => `${x.title || ''}\n${htmlToText(x.text)}`.trim())
		.join('\n\n');
}
