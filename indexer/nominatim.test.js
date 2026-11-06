import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accept, inside } from './nominatim.js';

/** @param {string} addresstype @param {string} display_name @param {Record<string, string>} [address] */
const hit = (addresstype, display_name, address = {}) => ({ lon: '0', lat: '0', addresstype, display_name, address });

test('accept takes cities, not regions, unless the region is a city', () => {
	assert.equal(accept('Bristol', hit('city', 'Bristol, England, United Kingdom')), true);
	assert.equal(accept('California', hit('state', 'California, United States')), false);
	assert.equal(accept('Tokyo', hit('province', 'Tokyo, Japan', { 'ISO3166-2-lvl4': 'JP-13' })), true);
	assert.equal(accept('Nowhere', undefined), false);
});

test('accept checks the answer is in what the name ends with', () => {
	const sf = hit('city', 'San Francisco, California, United States', { country_code: 'us', 'ISO3166-2-lvl4': 'US-CA' });
	assert.equal(accept('San Francisco, CA', sf), true);
	assert.equal(accept('San Francisco, USA', sf), true);
	assert.equal(accept('San Francisco, Seattle', sf), false);
	const london = hit('city', 'Greater London, England, United Kingdom', { country_code: 'gb', 'ISO3166-2-lvl4': 'GB-ENG' });
	assert.equal(accept('London, UK', london), true);
	assert.equal(accept('Zürich, Switzerland', hit('city', 'Zurich, Switzerland')), true);
});

test('inside: a point in a bounding box', () => {
	const area = { ...hit('county', 'Bristol'), boundingbox: ['51.3', '51.6', '-2.8', '-2.4'] };
	assert.equal(inside({ ...hit('city', 'Bristol'), lon: '-2.6', lat: '51.45' }, area), true);
	assert.equal(inside({ ...hit('town', 'California, Missouri'), lon: '-92.5', lat: '38.6' }, area), false);
});
