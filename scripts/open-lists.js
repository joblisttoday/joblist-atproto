/**
 * Open every list of an account to contributions (sets `open: true`).
 *
 *   JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=… node scripts/open-lists.js
 */
import { AtpAgent } from '@atproto/api';
import config from '../src/lib/data/config.json' with { type: 'json' };

const agent = new AtpAgent({ service: process.env.JOBLIST_SERVICE || 'https://bsky.social' });
await agent.login({
	identifier: /** @type {string} */ (process.env.JOBLIST_HANDLE),
	password: /** @type {string} */ (process.env.JOBLIST_APP_PASSWORD)
});
const { data } = await agent.com.atproto.repo.listRecords({ repo: agent.assertDid, collection: config.collections.list, limit: 100 });
const writes = data.records
	.filter((r) => !(/** @type {any} */ (r.value).open))
	.map((r) => ({
		$type: 'com.atproto.repo.applyWrites#update',
		collection: config.collections.list,
		rkey: r.uri.split('/').pop(),
		value: { ...r.value, open: true }
	}));
if (writes.length) await agent.com.atproto.repo.applyWrites({ repo: agent.assertDid, writes });
console.log(`${writes.length} lists opened`);
