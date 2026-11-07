import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkList, placeLinks } from './place-links.js';

const index = /** @type {any} */ ({
	cities: [
		{ slug: 'berlin', name: 'Berlin', count: 481, fields: [] },
		{ slug: 'new-york', name: 'New York', count: 300, fields: [] }
	],
	fields: [{ slug: 'design', count: 40 }]
});

test('links to the pages of the cities and fields of some jobs, only those that exist', () => {
	const links = placeLinks(index).ofJobs([
		{ t: 'Product Designer', l: 'Berlin, Germany' },
		{ t: 'Designer', l: 'NYC | Berlin' },
		{ t: 'Cook', l: 'Atlantis' }
	]);
	assert.deepEqual(links.cities, [
		{ name: 'Jobs in Berlin', path: '/in/berlin', count: 2 },
		{ name: 'Jobs in New York', path: '/in/new-york', count: 1 }
	]);
	assert.deepEqual(links.fields, [{ name: 'Design jobs', path: '/field/design', count: 2 }]);
});

test('links to the city a list is about, and to the top ones', () => {
	assert.deepEqual(placeLinks(index).ofPlaces(['Berlin', 'Atlantis']), [{ name: 'Jobs in Berlin', path: '/in/berlin', count: 481 }]);
	assert.equal(placeLinks(index).top(1).cities.length, 1);
	assert.equal(placeLinks(null).top(5).cities.length, 0);
	assert.equal(linkList('x', []), '');
	assert.match(linkList('By city', [{ name: 'Jobs in Berlin', path: '/in/berlin', count: 481 }]), /<h2>By city<\/h2><ul><li><a href="\/in\/berlin">Jobs in Berlin<\/a> \(481 open jobs\)<\/li><\/ul>/);
});
