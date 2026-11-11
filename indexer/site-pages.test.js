import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sitePages, thingPages } from './site-pages.js';

test("the site's pages need no index: what joblist is, never its numbers", () => {
	const pages = sitePages();
	assert.deepEqual(
		pages.filter((p) => p.listed).map((p) => p.path),
		['/', '/jobs', '/companies', '/stats']
	);
	for (const { meta } of pages) assert.doesNotMatch(`${meta.title} ${meta.description}`, /\d{2,}/);
	assert.ok(pages.some((p) => p.path === '/apps' && p.meta.noindex));
});

test('one page for every organization and every job, by a rewrite, with no address of its own', () => {
	assert.deepEqual(
		thingPages().map((p) => [p.rule, p.path, p.meta.url]),
		[
			['/company/*', '/_page/company', undefined],
			['/job/*', '/_page/job', undefined]
		]
	);
});
