/**
 * Publish joblist's historical companies (CC0, github.com/joblisttoday/data)
 * as atproto records.
 *
 *   node scripts/import-joblist.js <companies-dir>            # dry run, prints a summary
 *   node scripts/import-joblist.js <companies-dir> --out x.json  # dry run, saves the records
 *   JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     node scripts/import-joblist.js <companies-dir> --write   # publish
 *
 * <companies-dir> holds one folder per company with an index.json.
 * Re-running updates records instead of duplicating them.
 */
import { writeFileSync } from 'node:fs';
import { AtpAgent } from '@atproto/api';
import config from '../src/lib/data/config.json' with { type: 'json' };
import providers from '../src/lib/data/providers.json' with { type: 'json' };
import { toDomain } from '../src/lib/models/company.js';
import { isUrl, readLegacyCompanies } from './lib/legacy.js';

const [dir = '../workers/.db-github-data/companies', ...flags] = process.argv.slice(2);
const write = flags.includes('--write');
const { company: COMPANY } = config.collections;
const PROVIDER_ALIASES = { ashbyhq: 'ashby' };
const LINK_FIELDS = ['twitter_url', 'linkedin_url', 'facebook_url', 'instagram_url', 'youtube_url', 'github_url', 'wikipedia_url'];
const now = new Date().toISOString();

/** @param {any} position */
function toLocation(position) {
	/** @type {Record<string, string>} */
	const location = {};
	if (position.city) location.name = capitalize(position.city.trim());
	if (position.address) location.address = [position.address, position.postal_code].filter(Boolean).join(', ');
	if (position.country) location.country = position.country;
	try {
		const [lon, lat] = JSON.parse(position.map).coordinates;
		if (Number.isFinite(lat) && Number.isFinite(lon)) {
			location.latitude = String(lat);
			location.longitude = String(lon);
		}
	} catch {
		// no coordinates
	}
	return location;
}

/** @param {string} s */
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/** @param {any} d */
function toJobBoard(d) {
	const provider = PROVIDER_ALIASES[d.job_board_provider] || d.job_board_provider;
	if (providers.some((p) => p.id === provider) && d.job_board_hostname) {
		return { provider, id: d.job_board_hostname };
	}
	return isUrl(d.job_board_url) ? { url: d.job_board_url } : undefined;
}

/** Read the old company folders and turn them into records keyed by domain. */
function readCompanies() {
	// A later folder with the same key replaces an earlier one.
	const byKey = new Map(readLegacyCompanies(dir).map((c) => [c.rkey, c]));
	return [...byKey.values()].map(({ slug, rkey, data: d }) => {
		/** @type {Record<string, any>} */
		const record = { $type: COMPANY, name: d.title.slice(0, 100), createdAt: now };
		if (isUrl(d.company_url) && toDomain(d.company_url)) record.url = d.company_url;
		if (d.description) record.description = [...d.description.trim()].slice(0, 3000).join('');
		if (d.tags?.length) record.tags = d.tags.slice(0, 20).map((/** @type {string} */ t) => t.toLowerCase());
		const locations = (d.positions || []).map(toLocation).filter((/** @type {object} */ l) => Object.keys(l).length);
		if (locations.length) record.locations = locations.slice(0, 50);
		const jobBoard = toJobBoard(d);
		if (jobBoard) record.jobBoard = jobBoard;
		const links = LINK_FIELDS.map((f) => d[f]).filter(isUrl);
		if (links.length) record.links = links;
		return { rkey, slug, record };
	});
}

/** @param {AtpAgent} agent @param {string} collection */
async function existing(agent, collection) {
	/** @type {Map<string, any>} */
	const records = new Map();
	let cursor;
	do {
		const { data } = await agent.com.atproto.repo.listRecords({ repo: agent.assertDid, collection, limit: 100, cursor });
		for (const r of data.records) records.set(r.uri.split('/').pop(), r.value);
		cursor = data.records.length ? data.cursor : undefined;
	} while (cursor);
	return records;
}

/** @param {AtpAgent} agent @param {any[]} writes */
async function applyInBatches(agent, writes) {
	for (let i = 0; i < writes.length; i += 100) {
		await agent.com.atproto.repo.applyWrites({ repo: agent.assertDid, writes: writes.slice(i, i + 100) });
		console.log(`  wrote ${Math.min(i + 100, writes.length)}/${writes.length}`);
	}
}

const companies = readCompanies();
const withBoard = companies.filter((c) => c.record.jobBoard?.provider).length;
const withMap = companies.filter((c) => c.record.locations?.some((/** @type {any} */ l) => l.latitude)).length;
const byDomain = companies.filter((c) => c.rkey.includes('.')).length;
console.log(`${companies.length} companies: ${byDomain} keyed by domain, ${withBoard} with a job board API, ${withMap} on the map`);

const out = flags[flags.indexOf('--out') + 1];
if (flags.includes('--out') && out) {
	writeFileSync(out, JSON.stringify({ companies }, null, '\t'));
	console.log(`records saved to ${out}`);
}

if (!write) {
	console.log('\nDry run. Add --write with JOBLIST_HANDLE and JOBLIST_APP_PASSWORD to publish.');
	process.exit(0);
}

const agent = new AtpAgent({ service: process.env.JOBLIST_SERVICE || 'https://bsky.social' });
await agent.login({
	identifier: /** @type {string} */ (process.env.JOBLIST_HANDLE),
	password: /** @type {string} */ (process.env.JOBLIST_APP_PASSWORD)
});

const knownCompanies = await existing(agent, COMPANY);
console.log(`publishing companies (${knownCompanies.size} already there)`);
await applyInBatches(
	agent,
	companies.map(({ rkey, record }) => ({
		$type: `com.atproto.repo.applyWrites#${knownCompanies.has(rkey) ? 'update' : 'create'}`,
		collection: COMPANY,
		rkey,
		value: { ...record, createdAt: knownCompanies.get(rkey)?.createdAt || record.createdAt }
	}))
);

console.log('done');
