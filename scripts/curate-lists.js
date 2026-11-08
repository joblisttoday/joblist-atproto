/**
 * joblist's lists by need from the commons map (src/lib/data/need-lists.json). Reads the
 * map's graph.json and joblist's published records once each; writes only with --write.
 *
 *   node scripts/curate-lists.js                       # the report, to read first
 *   node scripts/curate-lists.js --out lists.md        # save it
 *   node scripts/curate-lists.js --json > lists.json   # the proposal, for other tools
 *   node scripts/curate-lists.js --plan                # what --write would write now
 *   JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     node scripts/curate-lists.js --write             # write it, from that account
 *
 * --write writes from an account in config.bots only (each record then shows as not checked
 * by a person yet), at most need-lists.json write.companiesPerRun new organizations a run,
 * in small batches with pauses. Run it again later: it adds what is left, writes nothing twice.
 */
import { writeFileSync } from 'node:fs';
import { AtpAgent } from '@atproto/api';
import config from '../src/lib/data/config.json' with { type: 'json' };
import settings from '../src/lib/data/need-lists.json' with { type: 'json' };
import { installPoliteFetch } from './lib/http.js';
import { needListsReport, planWrites, proposeNeedLists } from './lib/need-lists.js';

installPoliteFetch();
const flags = process.argv.slice(2);
const out = flags.includes('--out') ? flags[flags.indexOf('--out') + 1] : '';
const write = flags.includes('--write');

/** @param {string} url */
async function json(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${url}: ${res.status}`);
	return res.json();
}

/** @typedef {{uri: string, value: Record<string, any>}} Published */

/**
 * An account's records of a collection, read from its server.
 * @param {AtpAgent} agent
 * @param {string} collection
 * @returns {Promise<Published[]>}
 */
async function ownRecords(agent, collection) {
	/** @type {Published[]} */
	const records = [];
	let cursor;
	do {
		const { data } = await agent.com.atproto.repo.listRecords({ repo: agent.assertDid, collection, limit: 100, cursor });
		records.push(...data.records.map((r) => ({ uri: r.uri, value: /** @type {Record<string, any>} */ (r.value) })));
		cursor = data.records.length ? data.cursor : undefined;
	} while (cursor);
	return records;
}

const [graph, records] = await Promise.all([json(settings.source), json(`${config.snapshot.path}/records.json`)]);
/** @param {string} uri */
const rkeyOf = (uri) => uri.split('/').pop() || '';
const known = new Set(/** @type {Published[]} */ (records.companyRecords).map((r) => rkeyOf(r.uri)));
const lists = proposeNeedLists(graph.commons || [], known);

if (write || flags.includes('--plan')) {
	/** @type {AtpAgent | null} */
	let agent = null;
	let did = config.bots[0];
	/** @type {{companies: Published[], lists: Published[]}} */
	let own;
	if (write) {
		if (!process.env.JOBLIST_HANDLE || !process.env.JOBLIST_APP_PASSWORD) throw new Error('--write needs JOBLIST_HANDLE and JOBLIST_APP_PASSWORD');
		agent = new AtpAgent({ service: process.env.JOBLIST_SERVICE || config.crawler.service });
		await agent.login({ identifier: process.env.JOBLIST_HANDLE, password: process.env.JOBLIST_APP_PASSWORD });
		did = agent.assertDid;
		if (!config.bots.includes(did)) throw new Error(`${did} is not in config.bots: its records would not show as unchecked`);
		// What the account has now, not the snapshot of up to six hours ago.
		own = { companies: await ownRecords(agent, config.collections.company), lists: await ownRecords(agent, config.collections.list) };
	} else {
		const by = (/** @type {Published} */ r) => r.uri.startsWith(`at://${did}/`);
		own = { companies: records.companyRecords.filter(by), lists: records.listRecords.filter(by) };
	}
	const writes = planWrites(lists, {
		own: new Set(own.companies.map((r) => rkeyOf(r.uri))),
		ownLists: own.lists.map((r) => ({ rkey: rkeyOf(r.uri), value: r.value })),
		perRun: settings.write.companiesPerRun,
		now: new Date().toISOString()
	});
	for (const w of writes) console.log(`${write ? '' : 'would '}${w.action} ${w.collection} ${w.rkey || ''} ${w.value.name}${w.value.companies ? ` (${w.value.companies.length} organizations)` : ''}`);
	if (!agent) {
		console.log(`\n${writes.length} writes. Dry run (from the snapshot): add --write with JOBLIST_HANDLE and JOBLIST_APP_PASSWORD.`);
		process.exit(0);
	}
	const { batchSize, pauseSeconds } = settings.write;
	for (let i = 0; i < writes.length; i += batchSize) {
		const batch = writes.slice(i, i + batchSize).map(({ collection, action, rkey, value }) => ({
			$type: action === 'create' ? /** @type {const} */ ('com.atproto.repo.applyWrites#create') : /** @type {const} */ ('com.atproto.repo.applyWrites#update'),
			collection,
			...(rkey && { rkey }),
			value
		}));
		await agent.com.atproto.repo.applyWrites({ repo: did, writes: batch });
		console.log(`  wrote ${Math.min(i + batchSize, writes.length)}/${writes.length}`);
		if (i + batchSize < writes.length) await new Promise((r) => setTimeout(r, pauseSeconds * 1000));
	}
	process.exit(0);
}

if (flags.includes('--json')) {
	console.log(JSON.stringify(lists, null, '\t'));
} else {
	const report = needListsReport(lists, { source: settings.source, readAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC' });
	if (out) {
		writeFileSync(out, report);
		console.log(`report written to ${out}`);
	} else console.log(report);
}
