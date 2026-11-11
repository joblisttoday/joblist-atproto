import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { llmsTxt } from './llms.js';

const text = llmsTxt();

test('llms.txt names every record type joblist reads, and every doc', () => {
	for (const id of ['today.joblist.company', 'today.joblist.job']) assert.match(text, new RegExp(`\\[${id.replaceAll('.', '\\.')}\\]`));
	assert.doesNotMatch(text, /today\.joblist\.(list|suggestion)\]/);
	assert.doesNotMatch(text, /authFull/);
	assert.equal((text.match(/blob\/main\/docs\//g) || []).length, readdirSync('docs').filter((f) => f.endsWith('.md')).length);
});

test('every value from config is filled in; only address patterns keep their braces', () => {
	assert.doesNotMatch(text, /\{(name|url|source)\}/);
	assert.match(text, /`\/\{domain\}`/);
	assert.doesNotMatch(text, /snapshot/i);
});
