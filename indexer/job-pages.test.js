import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonLd } from './html.js';
import { jobPages, jobPosting } from './job-pages.js';
import { toPost } from '../src/lib/models/job-post.js';

const value = {
	title: 'Engineer </script>',
	company: 'acme.org',
	url: 'https://joblist.today/job/did%3Aplc%3Aacme/3abc',
	description: 'Build things.\nWith us.',
	locations: [{ name: 'Berlin', country: 'DE' }],
	remote: 'remote',
	employment: 'full-time',
	apply: { url: 'mailto:jobs@acme.org', bluesky: true },
	createdAt: '2026-10-01T00:00:00.000Z',
	expiresAt: new Date(Date.now() + 30 * 864e5).toISOString()
};
const record = { did: 'did:plc:acme', rkey: '3abc', uri: 'at://did:plc:acme/today.joblist.job/3abc', cid: '', value };
const profiles = new Map([['did:plc:acme', { handle: 'acme.org' }]]);
const companies = new Map([['acme.org', /** @type {any} */ ({ key: 'acme.org', name: 'Acme', url: 'https://acme.org' })]]);

test('jobPosting describes the offer for search engines', () => {
	const schema = jobPosting(toPost(record, profiles), companies.get('acme.org'));
	assert.equal(schema['@type'], 'JobPosting');
	assert.equal(schema.employmentType, 'FULL_TIME');
	assert.equal(schema.jobLocationType, 'TELECOMMUTE');
	assert.equal(schema.validThrough, value.expiresAt);
	assert.deepEqual(schema.hiringOrganization, { '@type': 'Organization', name: 'Acme', sameAs: 'https://acme.org' });
	assert.equal(schema.jobLocation[0].address.addressLocality, 'Berlin');
	assert.equal(schema.jobLocation[0].address.addressCountry, 'DE');
	assert.deepEqual(schema.applicantLocationRequirements, [{ '@type': 'Country', name: 'DE' }]);
});

test('jobPosting: a remote offer with no country stays at its places', () => {
	const post = toPost({ ...record, value: { ...value, locations: [{ name: 'Berlin' }] } }, profiles);
	const schema = jobPosting(post, companies.get('acme.org'));
	assert.equal(schema.jobLocationType, undefined);
	assert.equal(schema.applicantLocationRequirements, undefined);
});

test('jobPages makes one page per live offer, with safe structured data', () => {
	const expired = { ...record, rkey: '3old', uri: 'at://did:plc:acme/today.joblist.job/3old', value: { ...value, expiresAt: '2020-01-01T00:00:00Z' } };
	const pages = jobPages([record, expired], companies, profiles);
	assert.equal(pages.length, 1);
	assert.equal(pages[0].path, '/job/did%3Aplc%3Aacme/3abc');
	assert.ok(!pages[0].meta.head.slice(0, -'</script>'.length).includes('</script>'));
	assert.match(pages[0].meta.body, /Build things\.<br>With us\./);
	assert.match(pages[0].meta.body, /mailto:jobs@acme\.org/);
	assert.match(jsonLd({ a: '<b>' }), /\\u003cb>/);
});

test('jobPages makes no page for what others post for a company that posts its own', () => {
	const fake = { ...record, did: 'did:plc:x', rkey: '3fake', uri: 'at://did:plc:x/today.joblist.job/3fake' };
	assert.deepEqual(
		jobPages([record, fake], companies, profiles).map((p) => p.path),
		['/job/did%3Aplc%3Aacme/3abc']
	);
});

test("page() keeps $ patterns in text as text", async () => {
	const { page } = await import('./html.js');
	const html = page('<html><head><title>x</title></head><body><div></div></body></html>', { title: "A $' B $& C", description: '$`', url: 'https://joblist.today/x', body: '<p>$1</p>' });
	assert.ok(html.includes("A $' B $&amp; C") || html.includes("A $' B $& C"));
	assert.ok(html.includes('<p>$1</p>'));
	assert.equal((html.match(/<\/head>/g) || []).length, 1);
});
