import { test } from 'node:test';
import assert from 'node:assert/strict';
import { robots, sitemap } from './sitemap.js';

test('sitemap lists every page under the origin', () => {
	const xml = sitemap('https://joblist.today', ['/', '/company/acme.org']);
	assert.match(xml, /<loc>https:\/\/joblist\.today\/<\/loc>/);
	assert.match(xml, /<loc>https:\/\/joblist\.today\/company\/acme\.org<\/loc>/);
});

test('sitemap escapes URLs', () => {
	assert.match(sitemap('https://x.org', ['/a?b=1&c=2']), /a\?b=1&amp;c=2/);
});

test('sitemap says when a page last changed, when known and valid', () => {
	const xml = sitemap('https://x.org', [{ path: '/a', updated: '2026-11-02T17:49:12.345Z' }, { path: '/b', updated: 'soon' }, '/c']);
	assert.match(xml, /<loc>https:\/\/x\.org\/a<\/loc><lastmod>2026-11-02T17:49:12Z<\/lastmod>/);
	assert.match(xml, /<loc>https:\/\/x\.org\/b<\/loc><\/url>/);
	assert.match(xml, /<loc>https:\/\/x\.org\/c<\/loc><\/url>/);
});

test('robots points to the sitemap', () => {
	assert.match(robots('https://joblist.today'), /^Sitemap: https:\/\/joblist\.today\/sitemap\.xml$/m);
	assert.match(robots('https://joblist.today'), /^Sitemap: https:\/\/joblist\.today\/sitemap-places\.xml$/m);
});
