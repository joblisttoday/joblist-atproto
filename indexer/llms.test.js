import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { llmsTxt } from './llms.js';

const text = llmsTxt({ counts: { jobs: 34331, companies: 966 }, generatedAt: '2026-11-08T08:59:00.000Z' });

test('llms.txt names every record type joblist reads, every doc, and the counts', () => {
	for (const id of ['today.joblist.company', 'today.joblist.job']) assert.match(text, new RegExp(`\\[${id.replaceAll('.', '\\.')}\\]`));
	assert.doesNotMatch(text, /today\.joblist\.(list|suggestion)\]/);
	assert.doesNotMatch(text, /authFull/);
	assert.equal((text.match(/blob\/main\/docs\//g) || []).length, readdirSync('docs').filter((f) => f.endsWith('.md')).length);
	assert.match(text, /Now: 34,331 open jobs, 966 organizations \(snapshot of 2026-11-08 08:59 UTC\)\./);
});

test('every value from config is filled in; only address patterns keep their braces', () => {
	assert.doesNotMatch(text, /\{(name|url|source|snapshot|userAgent|hours)\}/);
	assert.match(text, /`\/\{domain\}`/);
});

test('without a snapshot, it says no counts', () => {
	assert.doesNotMatch(llmsTxt(), /^Now:/m);
});
