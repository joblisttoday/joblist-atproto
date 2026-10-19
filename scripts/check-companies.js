/**
 * Health check of every company in the network: does the website answer,
 * does the job board answer (and with how many open jobs), does the careers page answer.
 *
 *   node scripts/check-companies.js report.json
 *   node scripts/check-companies.js report.json --limit 50   # first 50 only, to try it
 *
 * Read only: it never writes records. Requests carry a joblist User-Agent,
 * a 15 s timeout, and run a few at a time.
 */
import { writeFileSync } from 'node:fs';
import { mapLimit } from '../src/lib/atproto/xrpc.js';
import { installPoliteFetch, USER_AGENT } from './lib/http.js';
import { loadCompanyRecords } from './lib/network.js';
import { checkCompany, summarize } from './lib/health.js';

const CONCURRENCY = 8;

const [out, ...flags] = process.argv.slice(2);
if (!out) {
	console.error('usage: node scripts/check-companies.js <report.json> [--limit n]');
	process.exit(1);
}
const limit = flags.includes('--limit') ? Number(flags[flags.indexOf('--limit') + 1]) : Infinity;

installPoliteFetch();

const started = Date.now();
const { repos, records } = await loadCompanyRecords();
const selected = records.slice(0, limit);
console.log(`${records.length} company records from ${repos} repos; checking ${selected.length} (User-Agent: ${USER_AGENT})`);

let done = 0;
const companies = await mapLimit(selected, CONCURRENCY, async (record) => {
	const result = await checkCompany(record);
	if (++done % 50 === 0) console.log(`  ${done}/${selected.length}`);
	return result;
});

const summary = summarize(companies);
writeFileSync(out, JSON.stringify({ checkedAt: new Date().toISOString(), repos, summary, companies }, null, '\t'));
console.log(JSON.stringify(summary, null, 2));
console.log(`report saved to ${out} in ${Math.round((Date.now() - started) / 1000)} s`);
