/**
 * Propose joblist's lists by need from the commons map (src/lib/data/need-lists.json):
 * a report to read, nothing written. Reads the map's graph.json and joblist's published
 * records once each.
 *
 *   node scripts/curate-lists.js                       # print the report
 *   node scripts/curate-lists.js --out lists.md        # save it
 *   node scripts/curate-lists.js --json > lists.json   # the proposal, for other tools
 */
import { writeFileSync } from 'node:fs';
import config from '../src/lib/data/config.json' with { type: 'json' };
import settings from '../src/lib/data/need-lists.json' with { type: 'json' };
import { installPoliteFetch } from './lib/http.js';
import { needListsReport, proposeNeedLists } from './lib/need-lists.js';

installPoliteFetch();
const flags = process.argv.slice(2);
const out = flags.includes('--out') ? flags[flags.indexOf('--out') + 1] : '';

/** @param {string} url */
async function json(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${url}: ${res.status}`);
	return res.json();
}

const [graph, records] = await Promise.all([json(settings.source), json(`${config.snapshot.path}/records.json`)]);
const known = new Set(/** @type {{uri: string}[]} */ (records.companyRecords).map((r) => r.uri.split('/').pop() || ''));
const lists = proposeNeedLists(graph.commons || [], known);

if (flags.includes('--json')) {
	console.log(JSON.stringify(lists, null, '\t'));
} else {
	const report = needListsReport(lists, { source: settings.source, readAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC' });
	if (out) {
		writeFileSync(out, report);
		console.log(`report written to ${out}`);
	} else console.log(report);
}
