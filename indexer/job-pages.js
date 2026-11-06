import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { isLive, placeNames, postPageUrl, postPath, toPost } from '../src/lib/models/job-post.js';
import { countryCode } from './countries.js';
import { escape, jsonLd } from './html.js';

/**
 * @typedef {import('../src/lib/models/job-post.js').JobPost} JobPost
 * @typedef {import('../src/lib/models/company.js').Company} Company
 */

/**
 * schema.org JobPosting, so search engines can list the offer.
 * @param {JobPost} post
 * @param {Company | undefined} company
 */
export function jobPosting(post, company) {
	/** @type {Record<string, any>} */
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'JobPosting',
		title: post.title,
		description: post.description || post.title,
		datePosted: post.createdAt,
		validThrough: post.expiresAt,
		url: postPageUrl(post),
		hiringOrganization: {
			'@type': 'Organization',
			name: company?.name || post.company,
			sameAs: company?.url || `https://${post.company}`
		}
	};
	const employment = /** @type {Record<string, string>} */ (config.jobPost.schemaEmployment)[post.employment || ''];
	if (employment) schema.employmentType = employment;
	const places = post.locations.filter((l) => l.name || l.country);
	if (places.length) {
		schema.jobLocation = places.map((l) => ({
			'@type': 'Place',
			address: {
				'@type': 'PostalAddress',
				addressLocality: l.name,
				streetAddress: l.address,
				addressCountry: countryCode(l.country) || l.country
			}
		}));
	}
	// Remote: search engines need the countries one can work from; without them, the offer stays at its places.
	const countries = [...new Set(post.locations.map((l) => countryCode(l.country)).filter(Boolean))];
	if (post.remote === 'remote' && countries.length) {
		schema.jobLocationType = 'TELECOMMUTE';
		schema.applicantLocationRequirements = countries.map((code) => ({ '@type': 'Country', name: code }));
	}
	return schema;
}

/**
 * Plain HTML of the offer, for readers without JavaScript.
 * @param {JobPost} post
 * @param {string} name company name
 * @param {string} handle poster's handle
 */
function body(post, name, handle) {
	const by = post.verified ? `✓ ${en['job.verified']}` : `${en['job.sharedBy']} @${handle}`;
	const apply = [
		/^https?:/i.test(post.apply.url || '') && `<a href="${escape(post.apply.url)}">${escape(en['job.apply.link'])}</a>`,
		/^mailto:/i.test(post.apply.url || '') && `<a href="${escape(post.apply.url)}">${escape(en['job.apply.email'])}</a>`,
		post.apply.bluesky &&
			`<a href="${escape(config.links.profile.replace('{handle}', handle))}">${escape(en['job.apply.bluesky'].replace('{handle}', handle))}</a>`
	].filter(Boolean);
	return [
		`<h1>${escape(post.title)}</h1>`,
		`<p><a href="/company/${escape(post.company)}">${escape(name)}</a> · ${escape(by)}</p>`,
		placeNames(post.locations) && `<p>${escape(placeNames(post.locations))}</p>`,
		post.description && `<p>${escape(post.description).replace(/\n/g, '<br>')}</p>`,
		apply.length && `<h2>${escape(en['job.apply'])}</h2><p>${apply.join(' · ')}</p>`
	]
		.filter(Boolean)
		.join('');
}

/**
 * One page per live job offer posted on joblist.
 * @param {import('../src/lib/atproto/records.js').RepoRecord[]} records
 * @param {Map<string, Company>} companies
 * @param {Map<string, {handle: string}>} profiles
 */
export function jobPages(records, companies, profiles) {
	return records
		.filter((r) => isLive(r.value))
		.map((r) => {
			const post = toPost(r, profiles);
			const company = companies.get(post.company);
			const name = company?.name || post.company;
			const handle = profiles.get(post.did)?.handle || post.did;
			const title = en['job.at'].replace('{title}', post.title).replace('{company}', name);
			return {
				path: postPath(post.did, post.rkey),
				meta: {
					title: `${title} · ${config.name}`,
					description: [placeNames(post.locations), post.description].filter(Boolean).join(' · ') || title,
					url: postPageUrl(post),
					type: 'article',
					head: jsonLd(jobPosting(post, company)),
					body: body(post, name, handle)
				}
			};
		});
}
