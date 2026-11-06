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
import { join } from 'node:path';
import { mapPoints, toCompany } from '../src/lib/models/company.js';
import { crawlRecords } from './crawl.js';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { fetchBoardJobs, recordJobs } from './jobs.js';
import { findOffices, officeKey } from './offices.js';
import { geocode, locate, placeNames } from './places.js';
import { suggest } from './suggest.js';

const out = process.argv[2] || 'static/snapshot';
const started = Date.now();
const generatedAt = new Date().toISOString();

const { records, profiles } = await crawlRecords();
const companies = groupCompanies(records.company, profiles);
console.log(`records: ${records.company.length} company, ${records.list.length} list, ${records.suggestion.length} suggestion, ${records.job.length} job, from ${profiles.size} accounts`);

const board = await fetchBoardJobs(companies);
const jobs = [...recordJobs(records.job, profiles), ...board.jobs];
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
	const point = locate(job.l, byKey.get(job.c), places, offices);
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
	// duplicates: [kept, other] companies that share a job board, to merge.
	'health.json': { generatedAt, companies: board.health, duplicates: board.duplicates },
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
console.log(`snapshot written to ${out} in ${files['meta.json'].seconds}s`);

/**
 * @param {import('../src/lib/atproto/records.js').RepoRecord[]} companyRecords
 * @param {Map<string, {handle: string}>} profiles
 */
function groupCompanies(companyRecords, profiles) {
	/** @type {Map<string, typeof companyRecords>} */
	const byKey = new Map();
	for (const r of companyRecords) {
		if (!r.value?.name) continue;
		byKey.set(r.rkey, [...(byKey.get(r.rkey) || []), r]);
	}
	return [...byKey.values()].map((versions) => toCompany(versions, profiles));
}
