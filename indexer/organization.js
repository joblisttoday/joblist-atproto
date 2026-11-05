/**
 * @typedef {import('../src/lib/models/company.js').Company} Company
 */

/**
 * schema.org Organization for a company page, so search engines know whose page it is.
 * @param {Company} company
 * @param {string} pageUrl the company's page on joblist
 */
export function organization(company, pageUrl) {
	/** @type {Record<string, any>} */
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': pageUrl,
		name: company.name
	};
	if (company.url) schema.url = company.url;
	if (company.description) schema.description = company.description;
	if (company.links.length) schema.sameAs = company.links;
	const places = company.locations.filter((l) => l.name || l.country);
	if (places.length) {
		schema.location = places.map((l) => ({
			'@type': 'Place',
			name: l.name,
			address: { '@type': 'PostalAddress', addressLocality: l.name, streetAddress: l.address, addressCountry: l.country }
		}));
	}
	return schema;
}
