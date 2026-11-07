import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { citiesOf, landingFiles } from './landing.js';

const places = { 'berlin, germany': [13.4, 52.5], berlin: [13.4, 52.5], nyc: [-74, 40.7], 'new york': [-74, 40.7], germany: 0 };

test('a job is in the cities its location names, found as cities', () => {
	assert.deepEqual(citiesOf({ t: 'x', u: 'u', c: 'c', l: 'Berlin, Germany | Remote' }, places), [{ slug: 'berlin', name: 'Berlin' }]);
	// Aliases merge spellings; a country is no city.
	assert.deepEqual(citiesOf({ t: 'x', u: 'u', c: 'c', l: 'NYC; Germany' }, places), [{ slug: 'new-york', name: 'NYC' }]);
	assert.deepEqual(citiesOf({ t: 'x', u: 'u', c: 'c', l: 'Atlantis' }, places), []);
});

test('pages for cities and fields with enough jobs, newest first', () => {
	const { city, field, cityField } = config.landing.minJobs;
	const many = Math.max(city, field, cityField);
	/** @type {import('./jobs.js').IndexedJob[]} */
	const jobs = [];
	for (let i = 0; i < many; i++) {
		const minute = String(i % 60).padStart(2, '0');
		jobs.push({ t: `Product Designer ${i}`, u: `https://a.example/${i}`, c: 'acme.org', l: 'Berlin', p: `2026-11-0${1 + (i % 5)}T10:${minute}Z` });
	}
	jobs.push({ t: 'Lone Engineer', u: 'https://b.example/1', c: 'beta.org', l: 'New York' });
	jobs.push({ t: 'Posted Designer', u: 'https://c.example', c: 'acme.org', l: 'Berlin', p: '2026-11-07T00:00:00.000Z', s: 'at://did:plc:abc/today.joblist.job/3k' });
	const files = new Map(landingFiles(jobs, new Map([['acme.org', 'Acme']]), places, '2026-11-07T01:00Z'));
	const index = files.get('landing/index.json');
	assert.deepEqual(index.cities, [{ slug: 'berlin', name: 'Berlin', count: many + 1 }]);
	assert.deepEqual(index.fields, [{ slug: 'design', count: many + 1 }]);
	assert.equal(index.total, many + 2);
	const berlin = files.get('landing/in/berlin.json');
	assert.equal(berlin.name, 'Berlin');
	assert.deepEqual(berlin.fields, [{ slug: 'design', count: many + 1 }]);
	assert.equal(berlin.names['acme.org'], 'Acme');
	// The posted job first, linking to its page here.
	assert.equal(berlin.jobs[0].t, 'Posted Designer');
	assert.equal(berlin.jobs[0].u, `${config.url}/job/did%3Aplc%3Aabc/3k`);
	assert.ok(berlin.jobs.every((/** @type {any} */ j, /** @type {number} */ i, /** @type {any[]} */ all) => !i || (all[i - 1].p || '') >= (j.p || '')));
	assert.ok(berlin.jobs.length <= config.landing.shown);
	assert.deepEqual(files.get('landing/field/design.json').cities, [{ slug: 'berlin', name: 'Berlin', count: many + 1 }]);
	assert.ok(files.has('landing/in/berlin/design.json'));
	assert.ok(!files.has('landing/in/new-york.json'));
	assert.equal(files.get('landing/new.json').count, many + 2);
});
