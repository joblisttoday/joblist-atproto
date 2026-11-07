import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { page } from './html.js';

const template = '<html><head><title>x</title></head><body></body></html>';
const meta = { title: 'T', description: 'D', url: 'https://joblist.today/', body: '' };
/** @param {string} html */
const preloaded = (html) => [...html.matchAll(/rel="preload"[^>]*href="[^"]*\/([^"/]+)"/g)].map((m) => m[1]);

test('a page preloads only the snapshot files it starts from', () => {
	assert.deepEqual(preloaded(page(template, meta)), config.snapshot.preload.page);
	assert.deepEqual(preloaded(page(template, { ...meta, preload: config.snapshot.preload.counts })), ['records.json', 'counts.json']);
	assert.ok(preloaded(page(template, { ...meta, preload: config.snapshot.preload.explore })).includes('jobs.json'));
	assert.ok(!preloaded(page(template, meta)).includes('jobs.json'));
});
