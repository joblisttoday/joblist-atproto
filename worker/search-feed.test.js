import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matching, searchFeed, searchLabel } from './search-feed.js';

const data = {
	generatedAt: '2026-11-07T01:00Z',
	names: { 'acme.org': 'Acme', 'paint.example': 'Paint' },
	jobs: [
		{ t: 'Product Designer', u: 'https://a.example/1', c: 'acme.org', l: 'Lisbon, Portugal', p: '2026-11-07T00:30Z' },
		{ t: 'Engineer', u: 'https://a.example/2', c: 'acme.org', l: 'Berlin', p: '2026-11-07T00:20Z' },
		{ t: 'Painter', u: 'https://p.example/3', c: 'paint.example', l: 'Lisbon', d: 'Design', p: '2026-11-07T00:10Z' },
		{ t: 'Bad link', u: 'javascript:alert(1)', c: 'acme.org', l: 'Lisbon', p: '2026-11-07T00:05Z' },
		null
	]
};

test('a search finds its recent jobs as the explorer does', () => {
	const found = matching(data.jobs, data.names, { query: 'design', where: 'lisbon', remote: '' });
	assert.deepEqual(found.map((j) => j.t), ['Product Designer', 'Painter']);
	assert.deepEqual(matching(data.jobs, data.names, { query: 'paint', where: '', remote: '' }).map((j) => j.t), ['Painter'], 'by company name too');
});

test('its feed says the search and links back to it', () => {
	const feed = searchFeed('?q=design&where=Lisbon', data);
	assert.match(feed, /<title>New jobs: design · Lisbon · joblist<\/title>/);
	assert.match(feed, /<link rel="self" type="application\/atom\+xml" href="https:\/\/joblist\.today\/feed\/search\.xml\?q=design&amp;where=Lisbon"\/>/);
	assert.match(feed, /<link rel="alternate" type="text\/html" href="https:\/\/joblist\.today\/#q=design&amp;where=Lisbon"\/>/);
	assert.equal((feed.match(/<entry>/g) || []).length, 2);
	assert.equal(searchLabel({ query: '', where: '', remote: 'remote', pay: true }), 'Remote · Shows pay');
});

test('a broken file gives an empty feed', () => {
	assert.equal((searchFeed('?q=x', { jobs: 'nope', names: null }).match(/<entry>/g) || []).length, 0);
});
