import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readWorkplaces } from './workplaces.js';

const companies = new Map([['acme.org', /** @type {any} */ ({ key: 'acme.org', jobBoard: { provider: 'greenhouse', id: 'acme' } })]]);
/** @param {string} id @param {string} p @param {object} [more] */
const job = (id, p, more = {}) => ({ t: id, u: `https://boards.example/acme/jobs/${id}`, c: 'acme.org', p, ...more });
const texts = /** @type {Record<string, string>} */ ({ 1: 'This is a remote role.', 2: 'We are a friendly team.', 3: 'Hybrid work model, 3 days a week in the office.', 5: '' });

// Each run reads the boards again: its jobs are new objects.
const open = () => [job('1', '2026-11-01T00:00Z'), job('2', '2026-11-02T00:00Z'), job('3', '2026-10-01T00:00Z'), job('4', '2026-11-03T00:00Z', { r: 'onsite' }), job('5', '2026-11-04T00:00Z')];

test('reads the newest unsaid jobs once, sets what they say, keeps the rest for next run', async () => {
	const jobs = open();
	const asked = /** @type {string[]} */ ([]);
	const describe = async (/** @type {any} */ _c, /** @type {{id: string}} */ { id }) => (asked.push(id), texts[id] ?? '');
	const { cache, read, said } = await readWorkplaces(jobs, companies, { 'https://gone.example/1': 'remote' }, { perRun: 3, concurrency: 1, describe });
	// Newest first, the board's own answer never asked, at most 3.
	assert.deepEqual(asked, ['5', '2', '1']);
	assert.equal(jobs[0].r, 'remote');
	assert.equal(jobs[1].r, undefined);
	// No text (an error): not kept, asked again next run; a job gone is forgotten.
	assert.deepEqual(cache, { 'https://boards.example/acme/jobs/2': '', 'https://boards.example/acme/jobs/1': 'remote' });
	assert.equal(read, 2);
	assert.equal(said, 1);

	const again = open();
	const next = await readWorkplaces(again, companies, cache, { perRun: 3, concurrency: 1, describe });
	assert.deepEqual(asked.slice(3), ['5', '3']);
	assert.equal(again[0].r, 'remote');
	assert.equal(again[2].r, 'hybrid');
	assert.equal(next.said, 2);
});
