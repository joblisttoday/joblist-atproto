import { countryCode } from './countries.js';

/**
 * @typedef {import('../src/lib/models/company.js').Company} Company
 */

/**
 * schema.org Organization for a company page, so search engines know whose page it is.
 * @param {Company} company
 * @param {string} pageUrl the company's page on joblist
 * @param {string} [logo] its picture (its Bluesky account's)
 */
export function organization(company, pageUrl, logo) {
	/** @type {Record<string, any>} */
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': pageUrl,
		name: company.name
	};
	if (company.url) schema.url = company.url;
	if (logo) schema.logo = logo;
	if (company.description) schema.description = company.description;
	if (company.links.length) schema.sameAs = company.links;
	const places = company.locations.filter((l) => l.name || l.country);
	if (places.length) {
		schema.location = places.map((l) => ({
			'@type': 'Place',
			name: l.name,
			address: { '@type': 'PostalAddress', addressLocality: l.name, streetAddress: l.address, addressCountry: countryCode(l.country) || l.country }
		}));
	}
	return schema;
}
