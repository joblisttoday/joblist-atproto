/**
 * The site's own files, after the app's build, from no index: its pages with a real title,
 * description and link-preview tags (indexer/site-pages.js), the page shared by every
 * domain and handle (/{domain}) and every job (/job/…), served by rewrites (_redirects), the
 * 404 page, the sitemap and robots.txt, llms.txt. The app reads the
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
/** _redirects after the site's own (static/_redirects): the first rule that matches is followed. */
const rules = ['# An organization\'s page is its domain (indexer/site.js).', '/company/:key  /:key  301'];
const things = thingPages();
for (const { path, meta } of things) write(path, page(template, meta));
// Cloudflare skips a rewrite to the same path (it worked in wrangler dev, not in production:
// /robots.txt got the catch-all's page): no catch-all for one-part addresses then. A domain's
// page is served by 404.html (wrangler.jsonc), on which the app starts and shows it.
rules.push('# One page for every job: the app shows each.');
for (const { path, rules: patterns } of things) for (const pattern of patterns) rules.push(`${pattern}  ${path}  200`);
const redirects = join(build, '_redirects');
appendFileSync(redirects, `${existsSync(redirects) ? '\n' : ''}${rules.join('\n')}\n`);
const home = pages.find((p) => p.path === '/');
if (home) writeFileSync(join(build, 'index.html'), page(template, home.meta));
console.log(`site: ${pages.length} pages, ${rules.length} rules, sitemap of ${pages.filter((p) => p.listed).length}`);
