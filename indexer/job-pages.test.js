import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonLd } from './html.js';
import { jobPages, jobPosting } from './job-pages.js';
import { toPost } from '../src/lib/models/job-post.js';

const value = {
	title: 'Engineer </script>',
	company: 'acme.org',
	url: 'https://atproto.joblist.today/job/did:plc:acme/3abc',
	description: 'Build things.\nWith us.',
	locations: [{ name: 'Berlin', country: 'DE' }],
	remote: 'remote',
	employment: 'full-time',
	apply: { url: 'mailto:jobs@acme.org', bluesky: true },
	createdAt: '2026-10-01T00:00:00.000Z',
	expiresAt: '2099-01-01T00:00:00.000Z'
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
});

test('jobPages makes one page per live offer, with safe structured data', () => {
	const expired = { ...record, rkey: '3old', uri: 'at://did:plc:acme/today.joblist.job/3old', value: { ...value, expiresAt: '2020-01-01T00:00:00Z' } };
	const pages = jobPages([record, expired], companies, profiles);
	assert.equal(pages.length, 1);
	assert.equal(pages[0].path, '/job/did:plc:acme/3abc');
	assert.ok(!pages[0].meta.head.slice(0, -'</script>'.length).includes('</script>'));
	assert.match(pages[0].meta.body, /Build things\.<br>With us\./);
	assert.match(pages[0].meta.body, /mailto:jobs@acme\.org/);
	assert.match(jsonLd({ a: '<b>' }), /\\u003cb>/);
});
