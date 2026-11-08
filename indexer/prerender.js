/**
 * Give every list, company and posted job its own HTML file, with a real title,
 * description and link-preview tags, and the content as plain HTML for
 * readers that do not run JavaScript (link previews, search engines, LLMs).
 * The app then starts as usual on top of it.
 *
 *   node indexer/prerender.js [build-dir] [snapshot-dir]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { toCompany } from '../src/lib/models/company.js';
import { Companies } from '../src/lib/models/companies.js';
import { membership, toList } from '../src/lib/models/list.js';
import { toSuggestion } from '../src/lib/models/suggestion.js';
import { postPath } from '../src/lib/models/job-post.js';
import { feedPath, isCompanyKey } from '../src/lib/models/landing.js';
import { escape, jsonLd, page } from './html.js';
import { jobPages } from './job-pages.js';
import { organization } from './organization.js';
import { robots, sitemap } from './sitemap.js';
import { notFoundPage, sitePages } from './site-pages.js';
import { embedSettings } from './embed-settings.js';
import { linkList, placeLinks } from './place-links.js';
import { llmsTxt } from './llms.js';
import { listFilePath } from '../src/lib/models/snapshot-job.js';
import { listPlace } from '../src/lib/models/list-place.js';
import { indexFile } from '../src/lib/models/landing.js';
import { t } from '../worker/text.js';

const [build = 'build', snapshot = 'static/snapshot'] = process.argv.slice(2);
const template = readFileSync(join(build, 'index.html'), 'utf8');
const {
	companyRecords,
	listRecords,
	suggestionRecords = [],
	jobRecords = [],
	profiles: profileObject
} = JSON.parse(readFileSync(join(snapshot, 'records.json'), 'utf8'));
const suggestions = suggestionRecords
	.filter((/** @type {any} */ r) => r.value?.list && r.value?.company)
	.map(toSuggestion);
const { jobs } = JSON.parse(readFileSync(join(snapshot, 'jobs.json'), 'utf8'));
const profiles = new Map(Object.entries(profileObject));
// Companies on Bluesky, for their pictures (a snapshot from before it has none).
const blueskyFile = join(snapshot, config.bluesky.file);
/** @type {Record<string, {avatar?: string}>} */
const bluesky = existsSync(blueskyFile) ? JSON.parse(readFileSync(blueskyFile, 'utf8')) : {};
// The pages per city and field (made by the Worker), to link to them.
const landingIndex = join(snapshot, indexFile());
const places = placeLinks(existsSync(landingIndex) ? JSON.parse(readFileSync(landingIndex, 'utf8')) : null);
const handleOf = (/** @type {string} */ did) => profiles.get(did)?.handle || did;

/** @type {Map<string, any[]>} */
const versionsByKey = new Map();
for (const r of companyRecords) {
	if (r.value?.name && isCompanyKey(r.rkey)) versionsByKey.set(r.rkey, [...(versionsByKey.get(r.rkey) || []), r]);
}
// The same company added twice gets one page; the other's address leads to it in the app.
const companies = new Companies([...versionsByKey.values()].map((versions) => toCompany(versions, profiles)));
/** @type {Map<string, number>} */
const jobCounts = new Map();
/** Each company's newest job, when it was first seen (ISO dates compare as text). @type {Map<string, string>} */
const newestJob = new Map();
/** Each company's jobs. @type {Map<string, any[]>} */
const jobsOf = new Map();
for (const job of jobs) {
	jobCounts.set(job.c, (jobCounts.get(job.c) || 0) + 1);
	const own = jobsOf.get(job.c);
	if (own) own.push(job);
	else jobsOf.set(job.c, [job]);
	if ((job.p || '') > (newestJob.get(job.c) || '')) newestJob.set(job.c, job.p);
}
/** @param {(string | undefined)[]} dates @returns {string} the latest */
const latest = (dates) => dates.reduce((a, b) => ((b || '') > (a || '') ? b : a), '') || '';

/**
 * Posted jobs link to their page here, job board jobs to the board.
 * @param {{u: string, s?: string}} job
 */
function jobLink(job) {
	const [, did, , rkey] = (job.s || '').match(/^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/) || [];
	return did ? postPath(did, rkey) : job.u;
}

/** Every prerendered page meant for search results, for the sitemap, with when it last changed. */
/** @type {{path: string, updated?: string}[]} */
const paths = [];
/** The lists, for their index and their authors' pages. @type {{name: string, path: string, count: number, did: string, updated: string}[]} */
const listed = [];

/** @param {string} path @param {string} html @param {boolean} [inSitemap] @param {string} [updated] */
function write(path, html, inSitemap = true, updated = '') {
	if (inSitemap) paths.push({ path, updated });
	// Files are named by the decoded path (job pages have encoded DIDs in their links).
	const dir = join(build, decodeURIComponent(path));
	// Paths come from records: none may lead out of the build.
	if (!resolve(dir).startsWith(resolve(build) + sep)) throw new Error(`page outside the build: ${path}`);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'index.html'), html);
}

let count = 0;
for (const record of listRecords) {
	if (!record.value?.name) continue;
	const list = toList(record);
	// Open lists include the companies others added to them.
	const members = membership(list, suggestions)
		.members.map((m) => companies.get(m.key))
		.filter(Boolean);
	const open = members.reduce((n, c) => n + (jobCounts.get(c.key) || 0), 0);
	const path = `/${handleOf(list.did)}/${list.rkey}`;
	const summary = `${t('list.companies', { count: members.length })} · ${t('jobs.count', { count: open })}. ${list.description || ''}`.trim();
	// No open job: a page for people, kept out of search results (and the sitemap) until there is one.
	// Changed when edited, or when one of its companies has a new job.
	const updated = latest([record.value.updatedAt, record.value.createdAt, ...members.map((c) => newestJob.get(c.key))]);
	listed.push({ name: list.name, path, count: members.length, did: list.did, updated });
	write(
		path,
		page(template, {
			title: `${list.name} · ${config.name}`,
			description: summary,
			url: config.url + path,
			noindex: !open,
			body: `<h1>${escape(list.name)}</h1><p>${escape(summary)}</p><p>${escape(en['list.by'])} @${escape(handleOf(list.did))}</p><ul>${members
				.map((c) => `<li><a href="/company/${escape(c.key)}">${escape(c.name)}</a></li>`)
				.join('')}</ul>${linkList(t('landing.cities'), places.ofPlaces(listPlace(list)?.places || []))}`,
			// Its own jobs file, not every job (indexer/list-files.js).
			preload: [...config.snapshot.preload.list, listFilePath(list)]
		}),
		open > 0,
		updated
	);
	count++;
}

for (const company of companies.values()) {
	const path = `/company/${company.key}`;
	const open = jobCounts.get(company.key) || 0;
	const where = [...new Set(company.locations.map((l) => l.name).filter(Boolean))].join(', ');
	const description = [company.description, where, open ? t('jobs.count', { count: open }) : ''].filter(Boolean).join(' · ');
	// Its jobs' cities and fields, with their pages.
	const links = places.ofJobs(jobsOf.get(company.key) || []);
	write(
		path,
		page(template, {
			title: `${company.name} · ${config.name}`,
			description,
			url: config.url + path,
			image: bluesky[company.key]?.avatar,
			// No open job: kept out of search results (and the sitemap) until there is one.
			noindex: !open,
			// Its feed, for readers to find (made by the Worker from the latest snapshot).
			head: [
				jsonLd(organization(company, config.url + path, bluesky[company.key]?.avatar)),
				// Its open jobs as JSON, for programs (indexer/company-files.js).
				isCompanyKey(company.key) &&
					`<link rel="alternate" type="application/json" href="${escape(`${config.snapshot.path}/${config.embed.dir}/${encodeURIComponent(company.key)}.json`)}">`,
				isCompanyKey(company.key) &&
					`<link rel="alternate" type="application/atom+xml" title="${escape(en['landing.company'].replace('{company}', () => company.name))}" href="${escape(config.url + feedPath({ company: company.key }))}">`
			]
				.filter(Boolean)
				.join('\n\t\t'),
			body: `<h1>${escape(company.name)}</h1><p>${escape(description)}</p>${
				company.url ? `<p><a href="${escape(company.url)}">${escape(company.url)}</a></p>` : ''
			}<ul>${(jobsOf.get(company.key) || [])
				.slice(0, 200)
				.map((/** @type {any} */ j) => `<li><a href="${escape(jobLink(j))}">${escape(j.t)}</a> ${escape(j.l || '')}</li>`)
				.join('')}</ul>${linkList(t('landing.byCity'), links.cities.slice(0, config.landing.linked))}${linkList(t('landing.byField'), links.fields)}`,
			// Its own jobs file, not every job (indexer/company-files.js).
			preload: [...config.snapshot.preload.company, `${config.embed.dir}/${encodeURIComponent(company.key)}.json`]
		}),
		open > 0,
		newestJob.get(company.key) || company.editedAt
	);
	count++;
}

for (const { path, meta, updated } of jobPages(jobRecords, companies, profiles, bluesky)) {
	write(path, page(template, meta), true, updated);
	count++;
}

// The site's own pages; the home last overwrites the template (it is read already).
const byAuthor = Map.groupBy(listed, (l) => l.did);
const site = sitePages({
	companies: [...companies.values()],
	lists: [...listed].sort((a, b) => b.count - a.count),
	profiles: [...byAuthor].map(([did, lists]) => ({ handle: handleOf(did), lists })),
	jobCounts,
	jobTotal: jobs.length,
	places: places.top(config.landing.linked),
	updated: latest([...newestJob.values()])
});
for (const { path, meta, listed: inSitemap, updated } of site) {
	if (path === '/') writeFileSync(join(build, 'index.html'), page(template, meta));
	else write(path, page(template, meta), inSitemap, updated);
	if (path === '/') paths.unshift({ path, updated });
	count++;
}
// Anything else: a real 404, on which the app still starts (a company added since this build).
writeFileSync(join(build, '404.html'), page(template, notFoundPage()));
writeFileSync(join(build, 'sitemap.xml'), sitemap(config.url, paths));
writeFileSync(join(build, 'robots.txt'), robots(config.url));
// For agents and other programs, from the project's own data (llms.js).
const meta = existsSync(join(snapshot, 'meta.json')) ? JSON.parse(readFileSync(join(snapshot, 'meta.json'), 'utf8')) : {};
writeFileSync(join(build, 'llms.txt'), llmsTxt({ counts: meta.counts, generatedAt: meta.generatedAt }));
mkdirSync(join(build, 'embed'), { recursive: true });
writeFileSync(join(build, 'embed', 'settings.json'), JSON.stringify(embedSettings()));
console.log(`prerendered ${count} pages, sitemap of ${paths.length}`);
