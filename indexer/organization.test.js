import { test } from 'node:test';
import assert from 'node:assert/strict';
import { organization } from './organization.js';

const company = /** @type {any} */ ({
	name: 'Acme',
	url: 'https://acme.org',
	description: 'Rockets',
	links: ['https://github.com/acme'],
	locations: [{ name: 'Berlin', country: 'DE' }, {}]
});

test('describes the company with its website, links and places', () => {
	const schema = organization(company, 'https://joblist.today/company/acme.org');
	assert.equal(schema['@type'], 'Organization');
	assert.equal(schema.url, 'https://acme.org');
	assert.deepEqual(schema.sameAs, ['https://github.com/acme']);
	assert.equal(schema.location.length, 1);
	assert.equal(schema.location[0].address.addressCountry, 'DE');
});

test('leaves out what the company does not have', () => {
	const schema = organization({ ...company, url: undefined, description: '', links: [], locations: [] }, 'x');
	assert.equal('url' in schema, false);
	assert.equal('sameAs' in schema, false);
	assert.equal('location' in schema, false);
});
