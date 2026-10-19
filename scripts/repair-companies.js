/**
 * Propose fixes for companies, from a health report of check-companies.js:
 * new job boards found on their websites, websites for companies without one,
 * and companies that look gone. Dry run by default: nothing is written.
 *
 *   node scripts/repair-companies.js report.json                    # print proposals
 *   node scripts/repair-companies.js report.json --out fixes.json   # also save them
 *   JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     node scripts/repair-companies.js report.json --write          # apply high-confidence fixes
 *
 * --write only updates records of the signed-in account, only for
 * high-confidence proposals, and never deletes: "likely gone" is reported only.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { AtpAgent } from '@atproto/api';
import { mapLimit } from '../src/lib/atproto/xrpc.js';
import { installPoliteFetch } from './lib/http.js';
import { loadCompanyRecords } from './lib/network.js';
import { proposeRepair } from './lib/repair.js';

const CONCURRENCY = 6;
const [reportPath, ...flags] = process.argv.slice(2);
if (!reportPath) {
	console.error('usage: node scripts/repair-companies.js <report.json> [--out fixes.json] [--write] [--only rkey,rkey]');
	process.exit(1);
}
const write = flags.includes('--write');
const flag = (/** @type {string} */ name) => (flags.includes(name) ? flags[flags.indexOf(name) + 1] : undefined);
const only = flag('--only')?.split(',');

installPoliteFetch();

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const checks = new Map(report.companies.map((/** @type {any} */ c) => [c.uri, c]));
const { records } = await loadCompanyRecords();

/** Companies worth a look: no website, or a board or careers page that is not live. */
const todo = records.filter((r) => {
	const c = checks.get(r.uri);
	if (!c || (only && !only.includes(r.rkey))) return false;
	return !r.value.url || c.board?.state !== 'live';
});
console.log(`report of ${report.checkedAt}: ${todo.length} of ${records.length} companies to look at`);

let done = 0;
const proposals = await mapLimit(todo, CONCURRENCY, async (record) => {
	const proposal = await proposeRepair(structuredClone(record), checks.get(record.uri));
	if (++done % 50 === 0) console.log(`  ${done}/${todo.length}`);
	return proposal;
});

const fixes = proposals.filter((p) => Object.keys(p.changes).length);
for (const p of fixes) {
	for (const [field, value] of Object.entries(p.changes)) {
		const before = records.find((r) => r.uri === p.uri)?.value[field];
		console.log(`${p.rkey} [${p.confidence}] ${field}: ${JSON.stringify(before ?? null)} → ${JSON.stringify(value)}`);
	}
	console.log(`    ${p.notes.join('; ')}`);
}
const gone = proposals.filter((p) => p.gone);
const summary = {
	lookedAt: todo.length,
	newBoard: { high: fixes.filter((p) => p.changes.jobBoard && p.confidence === 'high').length, low: fixes.filter((p) => p.changes.jobBoard && p.confidence === 'low').length },
	newWebsite: { high: fixes.filter((p) => p.changes.url && p.confidence === 'high').length, low: fixes.filter((p) => p.changes.url && p.confidence === 'low').length },
	likelyGone: gone.length,
	needsAPerson: proposals.filter((p) => p.stale).length,
	movedDomain: proposals.filter((p) => p.notes.some((/** @type {string} */ n) => n.startsWith('website now redirects'))).length
};
console.log(`\nlikely gone (${gone.length}): ${gone.map((p) => p.rkey).join(', ')}`);
console.log(JSON.stringify(summary, null, 2));

const out = flag('--out');
if (out) {
	writeFileSync(out, JSON.stringify({ basedOn: report.checkedAt, summary, proposals }, null, '\t'));
	console.log(`proposals saved to ${out}`);
}

if (!write) {
	console.log('\nDry run. Add --write with JOBLIST_HANDLE and JOBLIST_APP_PASSWORD to apply high-confidence fixes.');
	process.exit(0);
}

const agent = new AtpAgent({ service: process.env.JOBLIST_SERVICE || 'https://bsky.social' });
await agent.login({
	identifier: /** @type {string} */ (process.env.JOBLIST_HANDLE),
	password: /** @type {string} */ (process.env.JOBLIST_APP_PASSWORD)
});
const writes = fixes
	.filter((p) => p.confidence === 'high' && p.did === agent.assertDid)
	.map((p) => {
		const record = /** @type {import('./lib/network.js').RepoRecord} */ (records.find((r) => r.uri === p.uri));
		return { $type: /** @type {const} */ ('com.atproto.repo.applyWrites#update'), collection: 'today.joblist.company', rkey: p.rkey, value: { ...record.value, ...p.changes } };
	});
console.log(`updating ${writes.length} records (others belong to other accounts or are low confidence)`);
for (let i = 0; i < writes.length; i += 20) {
	await agent.com.atproto.repo.applyWrites({ repo: agent.assertDid, writes: writes.slice(i, i + 20) });
	console.log(`  wrote ${Math.min(i + 20, writes.length)}/${writes.length}`);
}
