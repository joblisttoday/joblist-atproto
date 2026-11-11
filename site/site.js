/**
 * The site's own files, after the app's build: its pages with a real title, description
 * and link-preview tags (site/site-pages.js), the 404 page (on which the app starts: an
 * organization's /{domain}, a job's /job/…), the sitemap, robots.txt, llms.txt, and what
 * GitHub Pages needs: CNAME (the domain) and .nojekyll (serve _app/ as it is).
 *
 *   node site/site.js [build-dir]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { page } from './html.js';
import { robots, sitemap } from './sitemap.js';
import { notFoundPage, sitePages } from './site-pages.js';
import { llmsTxt } from './llms.js';

const [build = 'build'] = process.argv.slice(2);
const template = readFileSync(join(build, 'index.html'), 'utf8');

/** @param {string} path @param {string} html */
function write(path, html) {
	const dir = join(build, path);
	if (!resolve(dir).startsWith(resolve(build) + sep)) throw new Error(`page outside the build: ${path}`);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'index.html'), html);
}

const pages = sitePages();
for (const { path, meta } of pages) {
	// The home last: it is the template the others are made from.
	if (path !== '/') write(path, page(template, meta));
}
// Anything else: a real 404, on which the app still starts.
writeFileSync(join(build, '404.html'), page(template, notFoundPage()));
writeFileSync(join(build, 'sitemap.xml'), sitemap(config.url, pages.filter((p) => p.listed).map((p) => p.path)));
writeFileSync(join(build, 'robots.txt'), robots(config.url));
writeFileSync(join(build, 'llms.txt'), llmsTxt());
writeFileSync(join(build, 'CNAME'), `${new URL(config.url).hostname}\n`);
writeFileSync(join(build, '.nojekyll'), '');
const home = pages.find((p) => p.path === '/');
if (home) writeFileSync(join(build, 'index.html'), page(template, home.meta));
console.log(`site: ${pages.length} pages, sitemap of ${pages.filter((p) => p.listed).length}`);
