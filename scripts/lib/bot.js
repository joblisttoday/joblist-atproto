/**
 * The crawler's own atproto account: credentials from the environment only,
 * and writes in small batches with pauses, far under the PDS limits
 * (5,000 points an hour; a create costs 3, an update 2).
 */
import { AtpAgent } from '@atproto/api';
import config from '../../src/lib/data/config.json' with { type: 'json' };
import { resolveDid } from '../../src/lib/atproto/identity.js';

const env = process.env;

/** Signed-in crawler, or null when no credentials are set. */
export async function botSession() {
	if (!env.CRAWLER_HANDLE || !env.CRAWLER_APP_PASSWORD) return null;
	const agent = new AtpAgent({ service: env.CRAWLER_SERVICE || config.crawler.service });
	await agent.login({ identifier: env.CRAWLER_HANDLE, password: env.CRAWLER_APP_PASSWORD });
	return agent;
}

/**
 * The crawler's DID without signing in (for dry runs): CRAWLER_DID, or the resolved CRAWLER_HANDLE.
 * @returns {Promise<string>}
 */
export async function botDid() {
	if (env.CRAWLER_DID) return env.CRAWLER_DID;
	if (env.CRAWLER_HANDLE) return resolveDid(env.CRAWLER_HANDLE).catch(() => 'did:crawler:unknown');
	return 'did:crawler:unknown';
}

/**
 * @param {AtpAgent} agent
 * @param {import('./plan.js').Write[]} writes
 * @param {{batchSize: number, pauseSeconds: number}} options
 */
export async function applyWrites(agent, writes, { batchSize, pauseSeconds }) {
	const collection = config.collections.company;
	for (let i = 0; i < writes.length; i += batchSize) {
		const batch = writes.slice(i, i + batchSize).map((w) => ({
			$type: `com.atproto.repo.applyWrites#${w.action}`,
			collection,
			rkey: w.rkey,
			value: w.value
		}));
		await agent.com.atproto.repo.applyWrites({ repo: agent.assertDid, writes: batch });
		console.log(`  wrote ${Math.min(i + batchSize, writes.length)}/${writes.length}`);
		if (i + batchSize < writes.length) await new Promise((r) => setTimeout(r, pauseSeconds * 1000));
	}
}
