/**
 * The joblist crawler: keeps companies healthy and adds the ones people point at,
 * from its own atproto account. Dry run by default.
 *
 *   node scripts/crawl.js                        # dry run: check, propose, save to static/snapshot/crawl/
 *   node scripts/crawl.js --out dir --limit 50   # elsewhere, on the first 50 companies only
 *   CRAWLER_HANDLE=crawler.joblist.today CRAWLER_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     node scripts/crawl.js --write              # also write the crawler's versions
 *
 * In order: (a) health check of every company's shown version, (b) repairs,
 * and boards for companies on Bluesky that have none, (c) new companies from
 * lists and hiring posts, (d) the crawler's writes.
 * Rules and sources: docs/crawler.md.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { mapLimit } from '../src/lib/atproto/xrpc.js';
import { crawlRecords } from '../indexer/crawl.js';
import { suggest } from '../indexer/suggest.js';
import { applyWrites, botDid, botSession } from './lib/bot.js';
import { companiesToConnect, connectBoard, loadBluesky, mergeConnection } from './lib/connect.js';
import { discoverCompany } from './lib/discover.js';
import { checkCompany, summarize } from './lib/health.js';
import { hiringAccounts } from './lib/hiring.js';
import { installPoliteFetch, USER_AGENT } from './lib/http.js';
import { siteOf } from './lib/match.js';
import { findOpenJobsBoard, loadOpenJobs } from './lib/openjobs.js';
import { planWrites } from './lib/plan.js';
import { proposeRepair } from './lib/repair.js';
import { healthFile } from './lib/report.js';
import { displayedVersion } from './lib/versions.js';

const settings = config.crawler;
const args = process.argv.slice(2);
const flag = (/** @type {string} */ name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const write = args.includes('--write');
const out = flag('--out') || settings.out;
const limit = Number(flag('--limit') || Infinity);

installPoliteFetch();
const count = (/** @type {any[]} */ items, /** @type {(x: any) => unknown} */ test) => items.filter(test).length;
const started = Date.now();
const step = (/** @type {string} */ text) => console.log(`[${Math.round((Date.now() - started) / 1000)}s] ${text}`);

const agent = write ? await botSession() : null;
if (write && !agent) throw new Error('--write needs CRAWLER_HANDLE and CRAWLER_APP_PASSWORD');
const did = agent?.assertDid || (await botDid());
/** @type {string[]} */
const bots = /** @type {any} */ (config).bots || [];
if (write && !bots.includes(did)) throw new Error(`add the crawler's DID ${did} to "bots" in src/lib/data/config.json first, so its versions are labelled`);

// Every version of every company, from the network.
const { records, profiles } = await crawlRecords();
/** @type {Map<string, any[]>} */
const versionsByKey = new Map();
for (const r of records.company) if (r.value?.name) versionsByKey.set(r.rkey, [...(versionsByKey.get(r.rkey) || []), r]);
const shown = [...versionsByKey.values()].map((versions) => displayedVersion(versions, profiles)).slice(0, limit);
step(`${versionsByKey.size} companies (${records.company.length} versions) from ${profiles.size} accounts; crawler ${did}; User-Agent ${USER_AGENT}`);

// (a) Health check of the version people see.
const checkedAt = new Date().toISOString();
let done = 0;
const checks = await mapLimit(shown, settings.concurrency, async (record) => {
	const check = await checkCompany(record);
	if (++done % 100 === 0) step(`checked ${done}/${shown.length}`);
	return check;
});
const checkByKey = new Map(checks.map((c) => [c.rkey, c]));
step('health check done');

// (b) Repairs, with Open Jobs as a last lookup for dead boards.
const openJobs = await loadOpenJobs(settings.openJobs).catch((error) => {
	console.warn(`Open Jobs unavailable: ${error.message}`);
	return null;
});
const todo = shown.filter((r) => !r.value.url || checkByKey.get(r.rkey)?.board?.state !== 'live' || checkByKey.get(r.rkey)?.website?.redirectedTo);
done = 0;
/** @type {any[]} repair proposals (scripts/lib/repair.js) with their company key */
const repairs = await mapLimit(todo, settings.concurrency, async (record) => {
	const check = /** @type {any} */ (checkByKey.get(record.rkey));
	/** @type {Record<string, any>} */
	const proposal = await proposeRepair(structuredClone(/** @type {any} */ (record)), check);
	const boardBroken = record.value.jobBoard?.provider && ['dead', 'empty'].includes(check.board?.state);
	if (openJobs && boardBroken && !proposal.changes.jobBoard && record.value.url && check.website?.state === 'ok') {
		const site = siteOf(new URL(record.value.url).hostname);
		const board = await findOpenJobsBoard(openJobs, [record.value.name, record.rkey, site.split('.')[0]], site);
		if (board && board.id.toLowerCase() !== record.value.jobBoard.id.toLowerCase()) {
			proposal.changes.jobBoard = { provider: board.provider, id: board.id };
			proposal.notes.push(`board ${board.provider}:${board.id} (${board.jobs} jobs) from Open Jobs, linking back to ${site}`);
			proposal.confidence = proposal.confidence || 'high';
		}
	}
	if (++done % 100 === 0) step(`repairs ${done}/${todo.length}`);
	return Object.assign(proposal, { key: record.rkey, version: record.uri });
});
const repairsByKey = new Map(repairs.map((p) => [p.key, p]));
step(`repairs done: looked at ${todo.length}`);

// (b) Boards for companies whose domain is their Bluesky handle and that have none.
const onBluesky = await loadBluesky(`${config.snapshot.path}/${config.bluesky.file}`).catch((error) => {
	console.warn(`bluesky.json unavailable: ${error.message}`);
	return {};
});
const toConnect = companiesToConnect(shown, onBluesky, repairsByKey, settings.bluesky.maxConnect);
const connected = await mapLimit(toConnect, settings.bluesky.concurrency, async (record) => {
	const result = await connectBoard(record, checkByKey.get(record.rkey), onBluesky[record.rkey].did, openJobs);
	if (result.changes) repairsByKey.set(record.rkey, mergeConnection(repairsByKey.get(record.rkey), record, /** @type {any} */ (result)));
	return { key: record.rkey, ...result };
});
repairs.splice(0, repairs.length, ...repairsByKey.values());
step(`boards for companies on Bluesky: looked at ${toConnect.length}, found ${count(connected, (c) => c.changes)}`);

// (c) New companies: keys in lists, suggestions and jobs without a record, and domain accounts posting about hiring.
const fromLists = suggest(
	[...versionsByKey.keys()].map((key) => /** @type {any} */ ({ key })),
	records
);
let hiring = { accounts: /** @type {import('./lib/hiring.js').HiringAccount[]} */ ([]), posts: 0, via: 'unavailable' };
try {
	hiring = await hiringAccounts(settings.search, agent);
} catch (error) {
	console.warn(`hiring posts unavailable: ${/** @type {Error} */ (error).message}`);
}
/** @type {{domain: string, name?: string, source: string}[]} */
const candidates = [
	...fromLists.map((s) => ({ domain: s.key, source: `lists and suggestions (${s.mentions} mentions)` })),
	...hiring.accounts.map((a) => ({ domain: a.handle, name: a.displayName, source: `hiring posts of @${a.handle}` }))
].filter((c) => !versionsByKey.has(c.domain));
const looked = await mapLimit(candidates, settings.concurrency, async (c) => ({ ...c, ...(await discoverCompany(c.domain, { name: c.name, source: c.source, openJobs })) }));
const discoveries = looked.flatMap((l) => (l.found ? [l.found] : []));
step(`discovery done: ${candidates.length} candidates, ${discoveries.length} with a live board`);

// (d) The crawler's writes.
const { writes, skipped } = planWrites({
	repairs: repairs.filter((p) => Object.keys(p.changes).length),
	discoveries,
	versionsByKey,
	profiles,
	ctx: { botDid: did, bots, checkedAt },
	caps: settings,
	now: new Date().toISOString()
});

const summary = {
	companies: versionsByKey.size,
	checked: checks.length,
	health: summarize(checks),
	repairs: {
		lookedAt: todo.length,
		newBoard: count(repairs, (p) => p.changes.jobBoard && p.confidence === 'high'),
		newBoardFromOpenJobs: count(repairs, (p) => p.notes?.some((/** @type {string} */ n) => n.includes('from Open Jobs'))),
		newWebsite: count(repairs, (p) => p.changes.url && p.confidence === 'high'),
		low: count(repairs, (p) => Object.keys(p.changes).length && p.confidence !== 'high'),
		likelyGone: count(repairs, (p) => p.gone),
		needsAPerson: count(repairs, (p) => p.stale),
		onBluesky: { companies: Object.keys(onBluesky).length, withoutBoard: toConnect.length, newBoard: count(connected, (c) => c.changes) }
	},
	discovery: {
		fromLists: { candidates: fromLists.length, found: count(discoveries, (d) => d.source.startsWith('lists')) },
		fromHiringPosts: { via: hiring.via, posts: hiring.posts, domainAccounts: hiring.accounts.length, new: count(candidates, (c) => c.source.startsWith('hiring')), found: count(discoveries, (d) => d.source.startsWith('hiring')) },
		openJobsBoards: openJobs ? [...openJobs.values()].reduce((n, b) => n + b.length, 0) : 0
	},
	writes: { total: writes.length, repairs: count(writes, (w) => w.kind === 'repair'), newCompanies: count(writes, (w) => w.kind === 'new'), create: count(writes, (w) => w.action === 'create'), update: count(writes, (w) => w.action === 'update') },
	skipped: Object.fromEntries(Object.entries(Object.groupBy(skipped, (s) => s.reason)).map(([reason, items]) => [reason, items?.length])),
	seconds: Math.round((Date.now() - started) / 1000)
};

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'health.json'), JSON.stringify(healthFile(checkedAt, checks, repairsByKey)));
writeFileSync(
	join(out, 'proposals.json'),
	JSON.stringify({ checkedAt, crawler: did, summary, writes, skipped, repairs: repairs.filter((p) => p.notes?.length), connected, discovery: looked }, null, '\t')
);
for (const w of writes) console.log(`${w.action} ${w.rkey} [${w.kind}] ${w.notes.join('; ')}`);
console.log(JSON.stringify(summary, null, 2));
step(`saved to ${out}/health.json and ${out}/proposals.json`);

if (agent) {
	await applyWrites(agent, writes, settings);
	step(`wrote ${writes.length} records as ${did}`);
} else {
	console.log('Dry run. Add --write with CRAWLER_HANDLE and CRAWLER_APP_PASSWORD to write the crawler’s versions.');
}
