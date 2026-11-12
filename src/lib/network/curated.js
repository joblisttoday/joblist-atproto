import config from '#lib/data/config.json';
import { resolveDid } from '#lib/atproto/identity.js';
import { listRepos } from '#lib/atproto/records.js';
import { xrpcGet } from '#lib/atproto/xrpc.js';
import { candidatesOf } from '#lib/models/curated.js';

/**
 * A list someone curates on Bluesky, read from the public AppView (a page of 100 at a time,
 * at most config.curated.max), and which of its accounts publish their page on joblist (the
 * relay's list of accounts with a today.joblist.company record: one request).
 * @typedef {import('#lib/models/curated.js').Curated} Curated
 * @typedef {import('#lib/models/curated.js').Member} Member
 */

const { appview } = config.services;

/**
 * Every page of a list-like answer.
 * @param {string} method
 * @param {Record<string, string>} params
 * @param {(page: any) => any[]} items
 */
async function all(method, params, items) {
	/** @type {any[]} */
	const out = [];
	let cursor;
	do {
		const page = await xrpcGet(appview, method, { ...params, limit: 100, ...(cursor ? { cursor } : {}) });
		out.push(...items(page));
		cursor = page.cursor;
	} while (cursor && out.length < config.curated.max);
	return out.slice(0, config.curated.max);
}

/** @param {any} p @returns {Member} */
const member = (p) => ({ did: p.did, handle: p.handle, name: p.displayName || undefined, avatar: p.avatar || undefined });

/**
 * A curated list's name and its organizations.
 * @param {Curated} curated
 */
export async function readCurated(curated) {
	const did = await resolveDid(curated.handle);
	/** @type {{name: string, members: Member[]}} */
	let read;
	if (curated.kind === 'follows') {
		read = { name: `@${curated.handle}`, members: await all('app.bsky.graph.getFollows', { actor: did }, (p) => (p.follows || []).map(member)) };
	} else {
		let list = `at://${did}/app.bsky.graph.list/${curated.rkey}`;
		let name = '';
		if (curated.kind === 'pack') {
			const { starterPack } = await xrpcGet(appview, 'app.bsky.graph.getStarterPack', { starterPack: `at://${did}/app.bsky.graph.starterpack/${curated.rkey}` });
			list = starterPack?.list?.uri || '';
			name = starterPack?.record?.name || '';
		}
		if (!list) return { name, candidates: [] };
		let first = true;
		const members = await all('app.bsky.graph.getList', { list }, (p) => {
			if (first) name ||= p.list?.name || '';
			first = false;
			return (p.items || []).map((/** @type {any} */ i) => member(i.subject));
		});
		read = { name, members };
	}
	// Which publish their page here: not needed to follow them, said when known.
	const onJoblist = new Set(await listRepos(config.collections.company).catch(() => []));
	return { name: read.name, candidates: candidatesOf(read.members, onJoblist) };
}
