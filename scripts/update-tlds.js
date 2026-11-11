/**
 * The top-level domains that exist (IANA's list), for joblist to tell a domain
 * (gitlab.com) from a name that only looks like one (test.env, llms.txt):
 * src/lib/data/tlds.json. Run now and then; new top-level domains are rare.
 *
 *   node scripts/update-tlds.js
 */
import { writeFileSync } from 'node:fs';
import config from '../src/lib/data/config.json' with { type: 'json' };

const res = await fetch('https://data.iana.org/TLD/tlds-alpha-by-domain.txt', { headers: { 'User-Agent': config.userAgent } });
if (!res.ok) throw new Error(`IANA: ${res.status}`);
const lines = (await res.text()).split('\n');
const tlds = lines.filter((l) => l && !l.startsWith('#')).map((l) => l.trim().toLowerCase());
if (tlds.length < 1000) throw new Error(`only ${tlds.length} top-level domains: not the list`);
writeFileSync('src/lib/data/tlds.json', `${JSON.stringify({ source: lines[0].replace(/^#\s*/, ''), tlds })}\n`);
console.log(`${tlds.length} top-level domains`);
