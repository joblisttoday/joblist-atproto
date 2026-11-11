/**
 * Publish joblist's lexicons as com.atproto.lexicon.schema records (record key: the NSID)
 * in the account that the `_lexicon.joblist.today` DNS record names, so any app can
 * resolve today.joblist.* schemas (see docs/lexicons.md). Dry run unless --write.
 *
 *   node scripts/publish-lexicons.js                      # dry run: what would be written
 *   JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     node scripts/publish-lexicons.js --write            # write (or update) the records
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { AtpAgent } from '@atproto/api';
import config from '../src/lib/data/config.json' with { type: 'json' };

const COLLECTION = 'com.atproto.lexicon.schema';
const write = process.argv.includes('--write');

/**
 * Every lexicon file under a folder, as the record that publishes it.
 * @param {string} dir
 * @returns {{nsid: string, record: Record<string, any>}[]}
 */
function schemaRecords(dir) {
	return readdirSync(dir, { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.json'))
		.sort()
		.map((file) => {
			const lexicon = JSON.parse(readFileSync(join(dir, file), 'utf8'));
			if (lexicon.lexicon !== 1 || typeof lexicon.id !== 'string') throw new Error(`${file}: not a lexicon`);
			return { nsid: lexicon.id, record: { $type: COLLECTION, ...lexicon } };
		});
}

const records = schemaRecords(config.lexicons.dir);
for (const { nsid } of records) console.log(`${write ? 'writing' : 'would write'} at://${config.lexicons.did}/${COLLECTION}/${nsid}`);

if (!write) {
	console.log('\nDry run. Add --write with JOBLIST_HANDLE and JOBLIST_APP_PASSWORD (of the account the _lexicon DNS record names).');
	process.exit(0);
}

const agent = new AtpAgent({ service: process.env.JOBLIST_SERVICE || 'https://bsky.social' });
await agent.login({
	identifier: /** @type {string} */ (process.env.JOBLIST_HANDLE),
	password: /** @type {string} */ (process.env.JOBLIST_APP_PASSWORD)
});
// Schemas are only found in the account the DNS names: refuse to write them anywhere else.
if (agent.assertDid !== config.lexicons.did) throw new Error(`signed in as ${agent.assertDid}, not ${config.lexicons.did}`);
for (const { nsid, record } of records) {
	// A schema already published as it is stays untouched.
	const published = await agent.com.atproto.repo.getRecord({ repo: agent.assertDid, collection: COLLECTION, rkey: nsid }).catch(() => null);
	if (published && isDeepStrictEqual(published.data.value, record)) {
		console.log(`  unchanged ${nsid}`);
		continue;
	}
	await agent.com.atproto.repo.putRecord({ repo: agent.assertDid, collection: COLLECTION, rkey: nsid, record });
	console.log(`  wrote ${nsid}`);
}
