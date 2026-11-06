import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geocode, locate, placeNames } from './places.js';

test('placeNames keeps the places and drops the work words', () => {
	assert.deepEqual(placeNames('Berlin, Germany | Remote (EMEA)'), ['Berlin, Germany']);
	assert.deepEqual(placeNames('Chattanooga, TN (Real Estate & Construction)'), ['Chattanooga, TN']);
	assert.deepEqual(placeNames('US - Remote'), []);
	assert.deepEqual(placeNames('Hybrid'), []);
	assert.deepEqual(placeNames('San Francisco, CA | New York City, NY'), ['San Francisco, CA', 'New York City, NY']);
	assert.deepEqual(placeNames(undefined), []);
});

test('geocode looks up each new place once, within the budget', async () => {
	const asked = [];
	const cache = { berlin: [13.4, 52.5] };
	const lookup = async (/** @type {string} */ name) => (asked.push(name), name === 'paris' ? [2.35, 48.85] : 0);
	const count = await geocode(['Berlin', 'Later', 'Nowhere', 'Paris', 'paris', 'Nowhere', 'nowhere'], cache, { budget: 2, delay: 0, lookup });
	assert.equal(count, 2);
	assert.deepEqual(asked, ['nowhere', 'paris']);
	assert.deepEqual(cache, { berlin: [13.4, 52.5], paris: [2.35, 48.85], nowhere: 0 });
});

const company = /** @type {any} */ ({
	locations: [
		{ name: 'Berlin', latitude: '52.52', longitude: '13.405' },
		{ name: 'Lisbon', latitude: '38.72', longitude: '-9.14' }
	]
});

test('locate prefers the company office of the same name', () => {
	assert.deepEqual(locate('Berlin, Germany', company, { 'berlin, germany': [13, 52] }), [13.405, 52.52]);
});

test('locate uses the looked up place otherwise', () => {
	assert.deepEqual(locate('Paris, France', company, { 'paris, france': [2.35, 48.85] }), [2.35, 48.85]);
	assert.equal(locate('Nowhere', company, { nowhere: 0 }), undefined);
});

test('locate falls back to the only office when the job names no place', () => {
	const single = /** @type {any} */ ({ locations: [company.locations[0]] });
	assert.deepEqual(locate('Hybrid', single, {}), [13.405, 52.52]);
	assert.equal(locate('Hybrid', company, {}), undefined);
});

test('locate prefers the office found for the company in that place', () => {
	const acme = /** @type {any} */ ({ name: 'Acme', locations: [] });
	const found = { 'acme|berlin, germany': [13.39, 52.51] };
	assert.deepEqual(locate('Berlin, Germany', acme, { 'berlin, germany': [13.4, 52.52] }, found), [13.39, 52.51]);
});

test('placeNames drops words that name no place', () => {
	assert.deepEqual(placeNames('Remote job'), []);
	assert.deepEqual(placeNames('Global'), []);
	assert.deepEqual(placeNames('Remote - EMEA'), []);
	assert.deepEqual(placeNames('Berlin (Hybrid), Germany'), ['Berlin, Germany']);
});

test('placeNames drops places that are only a country', () => {
	assert.deepEqual(placeNames('Remote - Brazil'), []);
	assert.deepEqual(placeNames('Remote (United States)'), []);
	assert.deepEqual(placeNames('USA'), []);
	assert.deepEqual(placeNames('Remote - Singapore'), ['Singapore']);
	assert.deepEqual(placeNames('Berlin, Germany'), ['Berlin, Germany']);
});

test('locate puts no remote job on the only office', () => {
	const one = /** @type {any} */ ({ locations: [{ name: 'Berlin', latitude: '52.52', longitude: '13.405' }] });
	assert.equal(locate('Remote', one, {}), undefined);
	assert.deepEqual(locate('', one, {}), [13.405, 52.52]);
});
