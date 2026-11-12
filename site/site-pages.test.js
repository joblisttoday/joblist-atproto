import assert from 'node:assert/strict';
import { test } from 'node:test';
import { notFoundPage, sitePages } from './site-pages.js';

test("the site's pages: what joblist is, never numbers", () => {
	const pages = sitePages();
	assert.deepEqual(
		pages.filter((p) => p.listed).map((p) => p.path),
		['/']
	);
	for (const { meta } of pages) assert.doesNotMatch(`${meta.title} ${meta.description}`, /\d{2,}/);
	assert.ok(pages.some((p) => p.path === '/apps' && p.meta.noindex));
});

test('every other address gets the 404 page, on which the app starts', () => {
	assert.ok(notFoundPage().noindex);
});
