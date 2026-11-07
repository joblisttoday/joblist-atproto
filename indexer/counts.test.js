import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countsFile, newestByCompany } from './counts.js';

test('newestByCompany keeps companies together, each newest first whatever its date writing, undated last', () => {
	const jobs = newestByCompany([
		{ t: 'a', u: 'u1', c: 'x', p: '2026-11-01T10:00Z' },
		{ t: 'b', u: 'u2', c: 'y', p: '2026-11-03T10:00Z' },
		{ t: 'c', u: 'u3', c: 'x' },
		{ t: 'd', u: 'u4', c: 'x', p: '2026-11-02T09:30:12.000Z' },
		{ t: 'e', u: 'u5', c: 'x', p: '2026-11-02T09:31Z' }
	]);
	assert.deepEqual(jobs.map((j) => j.t), ['e', 'd', 'a', 'c', 'b']);
});

test('countsFile counts board jobs only, and the places of lists about places', () => {
	const file = countsFile(
		[
			{ t: 'Engineer', u: 'https://acme.org/1', c: 'acme.org', l: 'Berlin, Germany' },
			{ t: 'Engineer', u: 'https://acme.org/2', c: 'acme.org', l: 'Paris, France' },
			{ t: 'Writer', u: 'https://beta.io/1', c: 'beta.io', l: 'Paris, France' },
			{ t: 'Posted', u: 'https://beta.io/2', c: 'beta.io', l: 'Berlin', s: 'at://did:plc:b/today.joblist.job/1' }
		],
		[{ value: { name: 'Startups in Berlin' } }, { value: { name: 'Robotics' } }, {}],
		'2026-11-07T00:00:00.000Z'
	);
	assert.equal(file.generatedAt, '2026-11-07T00:00:00.000Z');
	assert.deepEqual(file.offers, { 'acme.org': 1, 'beta.io': 1 });
	assert.deepEqual(file.here, { Berlin: { 'acme.org': 1 } });
	assert.deepEqual(file.places[0], ['Paris', 2]);
});
