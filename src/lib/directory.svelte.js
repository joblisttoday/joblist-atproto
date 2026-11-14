import config from '#lib/data/config.json' with { type: 'json' };
import { xrpcGet, handleOf } from '#lib/atproto.js';
import { loadProfile } from '#lib/profile.js';
import { locationLabel } from '#lib/places.js';

/**
 * Searching the organizations on joblist, with no list kept by joblist: the network's relay
 * says which accounts have an organization record (com.atproto.sync.listReposByCollection);
 * this browser reads each one from its own account (loadProfile: its handle its domain,
 * confirmed both ways), once per visit, a few at a time, and matches what is typed against
 * them and their open jobs.
 * @typedef {import('#lib/profile.js').Profile} Profile
 */

/** @type {Promise<Profile[]> | null} */
let all = null;
/** How many are read, of how many, as they come. */
export const reading = $state({ done: 0, total: 0 });

/** The accounts with an organization record, as the relay knows them. */
async function accounts() {
	/** @type {string[]} */
	const dids = [];
	let cursor;
	do {
		const page = await xrpcGet(config.services.relay, 'com.atproto.sync.listReposByCollection', { collection: config.collections.company, limit: 500, cursor });
		dids.push(...(page.repos || []).map((/** @type {{did: string}} */ r) => r.did));
		cursor = page.cursor;
	} while (cursor && dids.length < config.search.organizations);
	return dids.slice(0, config.search.organizations);
}

/**
 * Every organization on joblist, read once per visit; those whose handle is not their
 * domain, or that do not answer, are left out.
 * @returns {Promise<Profile[]>}
 */
export function organizations() {
	all ??= (async () => {
		const dids = await accounts();
		reading.total = dids.length;
		/** @type {Profile[]} */
		const found = [];
		const queue = [...dids];
		const worker = async () => {
			for (let did = queue.shift(); did; did = queue.shift()) {
				const handle = await handleOf(did).catch(() => null);
				const profile = handle ? await loadProfile(handle).catch(() => null) : null;
				if (profile?.company) found.push(profile);
				reading.done++;
			}
		};
		await Promise.all(Array.from({ length: 6 }, worker));
		return found.sort((a, b) => (a.company?.name || a.domain).localeCompare(b.company?.name || b.domain));
	})().catch((err) => {
		all = null;
		throw err;
	});
	return all;
}

/** Text as compared: lowercase, without accents. @param {string} text */
const fold = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/**
 * The organizations and open jobs that have every word typed, the organizations whose
 * name or domain has it first.
 * @param {Profile[]} profiles
 * @param {string} query
 */
export function match(profiles, query) {
	const words = fold(query).split(/\s+/).filter(Boolean);
	const has = (/** @type {string} */ text) => words.every((w) => text.includes(w));
	if (!words.length) return { organizations: [], jobs: [] };
	/** @type {{profile: Profile, first: boolean}[]} */
	const organizations = [];
	/** @type {{profile: Profile, job: import('#lib/profile.js').Job}[]} */
	const jobs = [];
	for (const profile of profiles) {
		const c = profile.company;
		const about = fold([c?.name, profile.domain, c?.description, c?.kind, ...(c?.tags || []), ...(c?.locations || []).map(locationLabel)].join(' '));
		const live = profile.jobs.filter((j) => j.live);
		const jobText = live.map((j) => fold([j.title, j.place, j.remote, j.employment, j.description].join(' ')));
		if (has(about) || jobText.some(has)) organizations.push({ profile, first: has(fold(`${c?.name} ${profile.domain}`)) });
		live.forEach((job, i) => {
			if (has(`${jobText[i]} ${fold(`${c?.name} ${profile.domain}`)}`)) jobs.push({ profile, job });
		});
	}
	organizations.sort((a, b) => Number(b.first) - Number(a.first));
	return { organizations: organizations.map((o) => o.profile), jobs };
}
