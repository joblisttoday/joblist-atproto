import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findOffices, officeKey } from './offices.js';

const places = { berlin: /** @type {[number, number]} */ ([13.4, 52.52]) };

test('an office near the place is kept, anything else is not', async () => {
	const answers = {
		'Idealo, berlin': { point: /** @type {[number, number]} */ ([13.39, 52.51]), category: 'office' },
		'Wise, berlin': { point: /** @type {[number, number]} */ ([13.4, 52.5]), category: 'landuse' },
		'Far, berlin': { point: /** @type {[number, number]} */ ([2.35, 48.85]), category: 'office' }
	};
	const offices = {};
	const keys = ['Idealo', 'Wise', 'Far', 'Nobody'].map((name) => officeKey(name, 'Berlin'));
	const lookup = async (/** @type {string} */ q) => answers[/** @type {keyof typeof answers} */ (q.replace(/^\w/, (c) => c.toUpperCase()))] || null;
	await findOffices(keys, offices, places, { delay: 0, lookup });
	assert.deepEqual(offices, { 'idealo|berlin': [13.39, 52.51], 'wise|berlin': 0, 'far|berlin': 0, 'nobody|berlin': 0 });
});

test('places not located are not searched', async () => {
	const offices = {};
	await findOffices([officeKey('Acme', 'Atlantis')], offices, places, { delay: 0, lookup: async () => null });
	assert.deepEqual(offices, {});
});
