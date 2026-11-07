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
import { fetchBoardJobs, firstJobs, recordJobs, toMinute } from './jobs.js';
import { dateOffers } from './ledger.js';
import { landingFiles } from './landing.js';
import { blueskyAccounts } from './bluesky.js';
import { verifyCompanyHandles } from './handles.js';
import { isCompanyKey } from '../src/lib/models/landing.js';
import { postPath } from '../src/lib/models/job-post.js';
import { findOffices, officeKey } from './offices.js';
import { geocode, locate, placeNames } from './places.js';
import { suggest } from './suggest.js';

const out = process.argv[2] || 'static/snapshot';
const started = Date.now();
const generatedAt = new Date().toISOString();

const crawled = await crawlRecords();
const { profiles } = crawled;
// Each record within its lexicon's limits, each account within its share: one account cannot bloat the snapshot.
const { records, dropped } = limitAccounts(crawled.records);
for (const { did, type, count } of dropped) console.warn(`records: ${count} ${type} records of ${did} left out (over ${config.limits.perAccount[/** @type {keyof typeof config.limits.perAccount} */ (type)]} per account)`);
// Handles that would make an account speak for a company, checked both ways (not only by the AppView).
const handles = await verifyCompanyHandles(profiles, records.company, records.job);
console.log(`handles: ${handles.checked} company handles checked, ${handles.unknown} could not be, not verified: ${handles.failed.join(', ') || 'none'}`);
const companies = groupCompanies(records.company, profiles);
console.log(`records: ${records.company.length} company, ${records.list.length} list, ${records.suggestion.length} suggestion, ${records.job.length} job, from ${profiles.size} accounts`);

const board = await fetchBoardJobs(companies);
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
		listRecords: records.list,
		suggestionRecords: records.suggestion,
		jobRecords: records.job,
		profiles: Object.fromEntries(profiles)
	},
	// `checked`: companies whose board was read, so the app knows an empty result is real.
	// gone: companies whose job board closed, as the last crawl found.
	'jobs.json': { generatedAt, checked: Object.keys(board.health), gone, jobs },
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
			lists: records.list.length,
			suggestions: records.suggestion.length,
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

// One small file per company, for the embeds on other sites: its open jobs, newest first.
const embeds = join(out, config.embed.dir);
mkdirSync(embeds, { recursive: true });
for (const [key, file] of companyFiles(companies, jobs, generatedAt)) writeFileSync(join(embeds, `${key}.json`), JSON.stringify(file));

// Small files for the pages per city and field and their feeds (landing.js), read by the Worker.
const landing = landingFiles(jobs, new Map(companies.map((c) => [c.key, c.name])), places, generatedAt);
for (const [name, file] of landing) {
	mkdirSync(dirname(join(out, name)), { recursive: true });
	writeFileSync(join(out, name), JSON.stringify(file));
}
console.log(`landing: ${landing.length} files`);
console.log(`snapshot written to ${out} in ${files['meta.json'].seconds}s`);

/**
 * Each company's open jobs, as embeds and feeds read them (the fields they show), under a
 * key safe as a file name. They speak in the company's name on other sites: only its job
 * board's jobs and those it posted itself (verified), the posted ones linking to their page here.
 * @param {{key: string, name: string}[]} companies
 * @param {import('./jobs.js').IndexedJob[]} jobs
 * @param {string} generatedAt
 * @returns {[string, {generatedAt: string, name: string, jobs: object[]}][]}
 */
function companyFiles(companies, jobs, generatedAt) {
	/** @type {Map<string, import('./jobs.js').IndexedJob[]>} */
	const byCompany = new Map();
	for (const job of jobs) byCompany.set(job.c, [...(byCompany.get(job.c) || []), job]);
	return companies
		.filter((c) => isCompanyKey(c.key))
		.map((c) => {
			const own = (byCompany.get(c.key) || [])
				.filter((j) => !j.s || j.v)
				.sort((a, b) => String(b.p || '').localeCompare(String(a.p || '')));
			return [c.key, { generatedAt, name: c.name, jobs: own.map(({ t, u, l, p, r, s }) => ({ t, u: s ? postUrl(s) || u : u, l, p, r })) }];
		});
}

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

/** A posted job's page here, from its record address (at://did/collection/rkey). @param {string} uri */
function postUrl(uri) {
	const [did, , rkey] = uri.replace('at://', '').split('/');
	return did && rkey ? config.url + postPath(did, rkey) : '';
}
