import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { canApply, isLive, placeNames, postPageUrl, postPath, toPost } from '../src/lib/models/job-post.js';
import { countryCode } from './countries.js';
import { escape, jsonLd } from './html.js';

/**
 * @typedef {import('../src/lib/models/job-post.js').JobPost} JobPost
 * @typedef {import('../src/lib/models/company.js').Company} Company
 */

/**
 * The countries one can work from, as ISO codes: those of the offer's places
 * (a place may be a country only: "Germany"), else those of the company's offices.
 * @param {JobPost} post
 * @param {Company | undefined} company
 */
function countriesOf(post, company) {
	/** @param {import('../src/lib/models/company.js').Location[]} places */
	const codes = (places) => [...new Set(places.map((l) => countryCode(l.country) || countryCode(l.name)).filter(Boolean))];
	const own = codes(post.locations);
	return own.length ? own : codes(company?.locations || []);
}

/**
 * schema.org JobPosting, so search engines can list the offer
 * (as Google reads it: developers.google.com/search/docs/appearance/structured-data/job-posting).
 * @param {JobPost} post
 * @param {Company | undefined} company
 * @param {string} [logo] the company's picture (its Bluesky account's)
 */
export function jobPosting(post, company, logo) {
	/** @type {Record<string, any>} */
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'JobPosting',
		title: post.title,
		description: post.description || post.title,
		identifier: { '@type': 'PropertyValue', name: company?.name || post.company, value: post.uri },
		datePosted: post.createdAt,
		validThrough: post.expiresAt,
		url: postPageUrl(post),
		hiringOrganization: {
			'@type': 'Organization',
			name: company?.name || post.company,
			sameAs: company?.url || `https://${post.company}`,
			...(logo ? { logo } : {})
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
	if (post.remote === 'remote') {
		schema.jobLocationType = 'TELECOMMUTE';
		// The countries one can work from: the offer's, else the company's.
		const countries = countriesOf(post, company);
		if (countries.length) schema.applicantLocationRequirements = countries.map((code) => ({ '@type': 'Country', name: code }));
	}
	// Applying starts on this page (an email, a message on Bluesky), not on another site's form.
	const ownPage = post.url.replace(/^https?:\/\/[^/]+/, '') === postPath(post.did, post.rkey);
	if (canApply(post.apply)) schema.directApply = ownPage && !/^https?:/i.test(post.apply.url || '');
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
 * @param {Map<string, {handle: string, avatar?: string}>} profiles
 * @param {Record<string, {avatar?: string}>} [bluesky] companies on Bluesky (bluesky.json)
 */
export function jobPages(records, companies, profiles, bluesky = {}) {
	return records
		.filter((r) => isLive(r.value))
		.map((r) => {
			const post = toPost(r, profiles);
			const company = companies.get(post.company);
			const name = company?.name || post.company;
			const handle = profiles.get(post.did)?.handle || post.did;
			// The company's own picture: its Bluesky account's, or the poster's when the poster is the company.
			const logo = bluesky[post.company]?.avatar || (post.verified ? profiles.get(post.did)?.avatar : undefined);
			// No site name after it: the company's name is in it, and joblist is often the company.
			const title = en['job.at'].replace('{title}', post.title).replace('{company}', name);
			return {
				path: postPath(post.did, post.rkey),
				meta: {
					title,
					description: [placeNames(post.locations), post.description].filter(Boolean).join(' · ') || title,
					url: postPageUrl(post),
					type: 'article',
					head: jsonLd(jobPosting(post, company, logo)),
					body: body(post, name, handle)
				}
			};
		});
}
