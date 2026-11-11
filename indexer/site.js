/**
 * The site's own files, after the app's build, from no index: its pages with a real title,
 * description and link-preview tags (indexer/site-pages.js), the page shared by every
 * organization and job (served for /company/* and /job/* by a rewrite: _redirects), the
 * 404 page, the sitemap and robots.txt, llms.txt, the embeds' settings. The app reads the
 * index itself, in the browser: an index never rebuilds the site (docs/architecture.md).
 *
 *   node indexer/site.js [build-dir]
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { page } from './html.js';
import { robots, sitemap } from './sitemap.js';
import { notFoundPage, sitePages, thingPages } from './site-pages.js';
import { embedSettings } from './embed-settings.js';
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
const rules = [];
for (const { path, rule, meta } of thingPages()) {
	write(path, page(template, meta));
	rules.push(`${rule}  ${path}  200`);
}
// After the site's own redirects (static/_redirects): theirs are more precise.
const redirects = join(build, '_redirects');
appendFileSync(redirects, `${existsSync(redirects) ? '\n' : ''}# One page for every organization and job: the app shows each (indexer/site.js).\n${rules.join('\n')}\n`);
// Anything else: a real 404, on which the app still starts.
writeFileSync(join(build, '404.html'), page(template, notFoundPage()));
writeFileSync(join(build, 'sitemap.xml'), sitemap(config.url, pages.filter((p) => p.listed).map((p) => p.path)));
writeFileSync(join(build, 'robots.txt'), robots(config.url));
writeFileSync(join(build, 'llms.txt'), llmsTxt());
mkdirSync(join(build, 'embed'), { recursive: true });
writeFileSync(join(build, 'embed', 'settings.json'), JSON.stringify(embedSettings()));
const home = pages.find((p) => p.path === '/');
if (home) writeFileSync(join(build, 'index.html'), page(template, home.meta));
console.log(`site: ${pages.length} pages, ${rules.length} shared ones, sitemap of ${pages.filter((p) => p.listed).length}`);
