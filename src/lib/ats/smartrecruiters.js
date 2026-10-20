import { getJson } from './job.js';
import { htmlToText } from './text.js';

/** @type {import('./index.js').Fetcher} */
export default async function smartrecruiters(id) {
	const data = await getJson(
		`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings?limit=100`
	);
	return (data?.content || []).map((/** @type {any} */ j) => ({
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
