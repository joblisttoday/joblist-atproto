/**
 * The joblist AppView, as a static build.
 *
 *   node indexer/index.js [out-dir]     (default: static/snapshot)
 *
 * Reads every joblist record from atproto and every company's job board,
 * then writes plain JSON files. Nothing here is a source of truth: anyone
 * can run this script and get the same snapshot from the same network.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { mapPoints, toCompany } from '../src/lib/models/company.js';
import { Companies } from '../src/lib/models/companies.js';
import { crawlRecords } from './crawl.js';
import { limitAccounts } from './caps.js';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { installPoliteFetch } from '../scripts/lib/http.js';
import { companyFiles } from './company-files.js';
import { fetchBoardJobs, firstJobs, recordJobs, toMinute } from './jobs.js';
import { dateOffers } from './ledger.js';
import { readWorkplaces } from './workplaces.js';
import { seeVersions } from './seen.js';
import { landingFiles } from './landing.js';
import { blueskyAccounts } from './bluesky.js';
import { verifyCompanyHandles } from './handles.js';
import { indexFile, isCompanyKey } from '../src/lib/models/landing.js';
import { findOffices, officeKey } from './offices.js';
import { geocode, locate, placeNames } from './places.js';
import { suggest } from './suggest.js';
import { countsFile, newestByCompany } from './counts.js';
import { statsFile } from './stats.js';

const out = process.argv[2] || 'static/snapshot';
const started = Date.now();
const generatedAt = new Date().toISOString();

// Every request says it is joblist and where to read about it, and gives up after a while.
installPoliteFetch();
const crawled = await crawlRecords();
const { profiles } = crawled;
// Each record within its lexicon's limits, each account within its share: one account cannot bloat the snapshot.
const { records, dropped } = limitAccounts(crawled.records);
for (const { did, type, count } of dropped) console.warn(`records: ${count} ${type} records of ${did} left out (over ${config.limits.perAccount[/** @type {keyof typeof config.limits.perAccount} */ (type)]} per account)`);
// Handles that would make an account speak for a company, checked both ways (not only by the AppView).
const handles = await verifyCompanyHandles(profiles, records.company, records.job);
console.log(`handles: ${handles.checked} company handles checked, ${handles.unknown} could not be, not verified: ${handles.failed.join(', ') || 'none'}`);
// Company versions ordered by when they first appeared, not by the date their author gives.
const versions = seeVersions(records.company, records.job, /** @type {any} */ (await loadCache(config.versions.file)), generatedAt, config.versions.newAccountDays);
records.company = versions.records;
console.log(`versions: ${versions.added} new company versions, ${versions.newAuthors} from new accounts over someone else's`);
const companies = groupCompanies(records.company, profiles);
console.log(`records: ${records.company.length} company, ${records.job.length} job, from ${profiles.size} accounts`);

const board = await fetchBoardJobs(companies);
// Where the work happens, from the descriptions of jobs whose board does not say (workplaces.js).
const workplaces = await readWorkplaces(board.jobs, new Map(companies.map((c) => [c.key, c])), /** @type {any} */ (await loadCache(config.workplaces.file)));
console.log(`workplaces: ${workplaces.read} descriptions read, ${workplaces.said} jobs say where they are done (${Object.keys(workplaces.cache).length} known)`);
const jobs = [...recordJobs(records.job, profiles, companies), ...board.jobs];
// Companies whose domain is their Bluesky handle.
const bluesky = await blueskyAccounts(companies.map((c) => c.key), /** @type {any} */ (await loadCache(config.bluesky.file)));
console.log(`bluesky: ${Object.keys(bluesky).length} companies have their domain as handle`);

// Each offer dated when it was first seen, not when its board last posted it again.
const dates = dateOffers(jobs, /** @type {any} */ (await loadCache(config.ledger.file)), /** @type {string} */ (toMinute(generatedAt)), config.ledger.keepDays);
console.log(`offers: ${Object.keys(dates.ledger).length} known, ${dates.reposted} jobs posted again keep their first date, ${dates.dated} undated jobs dated`);
console.log(`jobs: ${jobs.length} (${board.jobs.length} from job boards; ${board.dropped} not jobs left out; ${board.duplicates.length} companies added twice)`);

// Where each job is, from the places looked up so far (this run adds the most named new ones).
const places = await loadCache(config.geocode.placesFile);
const looked = await geocode(jobs.flatMap((j) => placeNames(j.l)), places);
const byKey = new Map(companies.map((c) => [c.key, c]));
// Then the companies' offices in those places, for those whose offices are not known yet.
const offices = await loadCache(config.geocode.officesFile);
const officeKeys = jobs.flatMap((j) => {
	const company = byKey.get(j.c);
	return company && !mapPoints(company).length ? placeNames(j.l).map((name) => officeKey(company.name, name)) : [];
});
const searched = await findOffices(officeKeys, offices, places);
for (const job of jobs) {
	const point = job.g || locate(job.l, byKey.get(job.c), places, offices);
	if (point) job.g = point;
}
console.log(`places: ${looked} looked up, ${Object.keys(places).length} known, ${jobs.filter((j) => j.g).length} jobs located`);
console.log(`offices: ${searched} looked up, ${Object.values(offices).filter(Boolean).length} found`);
// Each company's newest first: the app sorts all of them quickly from there.
newestByCompany(jobs);

// Boards the crawler found closed (their page gone): the app says so instead of "no open jobs".
const crawlHealth = join(out, 'crawl', 'health.json');
const gone = existsSync(crawlHealth)
	? Object.entries(JSON.parse(readFileSync(crawlHealth, 'utf8')).companies || {})
			.filter(([, c]) => /** @type {any} */ (c).board === 'dead')
			.map(([key]) => key)
	: [];

const files = {
	// Same shape as the app's local cache, so the app can start from it.
	'records.json': {
		loadedAt: generatedAt,
		companyRecords: records.company,
		jobRecords: records.job,
		profiles: Object.fromEntries(profiles)
	},
	// `checked`: companies whose board was read, so the app knows an empty result is real.
	// gone: companies whose job board closed, as the last crawl found.
	'jobs.json': { generatedAt, checked: Object.keys(board.health), gone, jobs },
	// What pages that only count jobs need (companies, the search box): small, instead of every job.
	'counts.json': countsFile(jobs, generatedAt, companies.map((c) => c.key)),
	// The newest offers, small: the list shows them at once, while jobs.json loads.
	// With their companies' names: the page shows them before it reads the companies.
	'first.json': (() => {
		const first = firstJobs(jobs, config.jobs.pageSize);
		const names = Object.fromEntries(first.map((j) => [j.c, companies.find((c) => c.key === j.c)?.name || j.c]));
		return { generatedAt, names, jobs: first };
	})(),
	// duplicates: [kept, other] companies that share a job board, to merge.
	'health.json': { generatedAt, companies: board.health, duplicates: board.duplicates },
	[config.ledger.file]: dates.ledger,
	[config.workplaces.file]: workplaces.cache,
	[config.versions.file]: versions.ledger,
	[config.bluesky.file]: bluesky,
	[config.geocode.placesFile]: places,
	[config.geocode.officesFile]: offices,
	'suggestions.json': { generatedAt, companies: suggest(companies, records) },
	'meta.json': {
		generatedAt,
		seconds: Math.round((Date.now() - started) / 1000),
		counts: {
			accounts: profiles.size,
			companies: companies.length,
			jobRecords: records.job.length,
			jobs: jobs.length
		}
	}
};

/**
 * What was already looked up: this folder's file, else the published snapshot's.
 * @param {string} name
 * @returns {Promise<import('./places.js').PlaceCache>}
 */
async function loadCache(name) {
	const file = join(out, name);
	if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
	// Only a cache never published starts empty: any other failure stops the run,
	// rather than publishing a snapshot that forgot where its jobs are.
	const res = await fetch(`${config.snapshot.path}/${name}`);
	if (res.status === 404) return {};
	if (!res.ok) throw new Error(`${name}: ${res.status}`);
	return await res.json();
}

mkdirSync(out, { recursive: true });
for (const [name, data] of Object.entries(files)) writeFileSync(join(out, name), JSON.stringify(data));

// One small file per company, for its page here and the embeds on other sites (company-files.js).
const embeds = join(out, config.embed.dir);
mkdirSync(embeds, { recursive: true });
for (const [key, file] of companyFiles(companies, jobs, { generatedAt, checked: Object.keys(board.health), gone })) {
	writeFileSync(join(embeds, `${key}.json`), JSON.stringify(file));
}

// Small files for the pages per city and field and their feeds (landing.js), read by the Worker.
const landing = landingFiles(jobs, new Map(companies.map((c) => [c.key, c.name])), places, generatedAt);
for (const [name, file] of landing) {
	mkdirSync(dirname(join(out, name)), { recursive: true });
	writeFileSync(join(out, name), JSON.stringify(file));
}
console.log(`landing: ${landing.length} files`);

// The trends behind /stats: weeks kept from the last file, the newest counted again.
const landingIndex = /** @type {any} */ (landing.find(([name]) => name === indexFile())?.[1]);
const stats = statsFile({ ledger: dates.ledger, previous: /** @type {any} */ (await loadCache(config.stats.file)), jobs, places, cities: landingIndex?.cities || [], generatedAt });
writeFileSync(join(out, config.stats.file), JSON.stringify(stats));
console.log(`stats: ${stats.weeks.length} weeks since ${stats.since}`);
console.log(`snapshot written to ${out} in ${files['meta.json'].seconds}s`);

/**
 * @param {import('../src/lib/atproto/records.js').RepoRecord[]} companyRecords
 * @param {Map<string, {handle: string}>} profiles
 */
function groupCompanies(companyRecords, profiles) {
	/** @type {Map<string, typeof companyRecords>} */
	const byKey = new Map();
	for (const r of companyRecords) {
		// A key is a page address and a file name: only domain-like keys (a long one stopped every run).
		if (!r.value?.name || !isCompanyKey(r.rkey)) continue;
		byKey.set(r.rkey, [...(byKey.get(r.rkey) || []), r]);
	}
	// The same company added twice is read once (companies.js).
	return [...new Companies([...byKey.values()].map((versions) => toCompany(versions, profiles))).values()];
}
