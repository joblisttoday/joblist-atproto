import { allowed } from '../src/lib/models/moderation.js';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { getProfiles } from '../src/lib/atproto/identity.js';
import { listRecords, listRepos } from '../src/lib/atproto/records.js';
import { mapLimit } from '../src/lib/atproto/xrpc.js';

/**
 * Every joblist record on the network, read the same way the app does:
 * the relay lists the repositories, each author's server gives the records.
 */
export async function crawlRecords() {
	const collections = Object.entries(config.collections);
	const reposByCollection = Object.fromEntries(
		await Promise.all(collections.map(async ([type, nsid]) => [type, await listRepos(nsid)]))
	);
	const dids = [...new Set(Object.values(reposByCollection).flat())];
	/** @type {Record<string, import('../src/lib/atproto/records.js').RepoRecord[]>} */
	const records = Object.fromEntries(collections.map(([type]) => [type, []]));
	await mapLimit(dids, config.limits.concurrency, async (did) => {
		for (const [type, nsid] of collections) {
			if (!reposByCollection[type].includes(did)) continue;
			try {
				records[type].push(...(await listRecords(did, nsid)).filter(allowed));
			} catch (err) {
				console.warn(`skipped ${type} of ${did}: ${err instanceof Error ? err.message : err}`);
			}
		}
	});
	const profiles = await getProfiles(dids);
	return { records, profiles };
}
