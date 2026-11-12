import config from '#lib/data/config.json';
import { getJobs } from '#lib/ats/index.js';
import { mapLimit } from '#lib/atproto/xrpc.js';
import { keep as store, readKept as stored } from '#lib/local/store.js';
import { boardOfKept, keyOf } from '#lib/models/kept.js';
import { kept } from './kept.svelte.js';
import { data } from './network.svelte.js';

/**
 * The jobs of the organizations saved in this browser, read live from their own job boards:
 * joblist keeps no list of jobs. Read at most config.kept.boardsPerVisit boards (the latest
 * saved first), and kept here config.kept.refreshHours: a board is asked once in a while,
 * not at every page.
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {import('#lib/models/company.js').Company} Company
 */

const KEY = 'kept-jobs.v1';

/** A link, short: its host and path. @param {string} url */
const short = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** The saved organizations as organizations: the one its own account describes when read, else what was saved. */
const companies = $derived(
	kept.list.map((item) => {
		const board = boardOfKept(item);
		const key = keyOf(item.url) || (board ? `${board.provider}-${board.id}` : short(item.url));
		const known = data.companies.get(key);
		if (known) return known;
		return /** @type {Company} */ (
			/** @type {unknown} */ ({
				key,
				name: item.name || short(item.url),
				url: keyOf(item.url) ? `https://${keyOf(item.url)}` : undefined,
				kind: '',
				tags: item.tags || [],
				locations: [],
				links: [],
				jobBoard: board,
				verified: false,
				editedAt: item.at,
				versions: []
			})
		);
	})
);

/** @type {Map<string, Job[]>} jobs by organization key */
let jobs = $state.raw(new Map());
const all = $derived([...jobs.values()].flat().sort((a, b) => String(b.published || '').localeCompare(String(a.published || ''))));
let reading = $state(false);
let asked = false;

async function read() {
	if (asked) return;
	asked = true;
	reading = true;
	const kept = /** @type {{at: number, jobs: [string, Job[]][]} | null} */ (await stored(KEY).catch(() => null));
	const boards = companies.filter((c) => c.jobBoard?.provider && c.jobBoard.id).slice(0, config.kept.boardsPerVisit);
	const fresh = kept && Date.now() - kept.at < config.kept.refreshHours * 3600 * 1000;
	const had = new Map(kept?.jobs || []);
	if (fresh && boards.every((c) => had.has(c.key))) {
		jobs = had;
		reading = false;
		return;
	}
	const read = await mapLimit(boards, config.limits.jobsConcurrency, async (c) => /** @type {[string, Job[]]} */ ([c.key, await getJobs(c)]));
	jobs = new Map(read);
	reading = false;
	store(KEY, { at: Date.now(), jobs: read });
}

export const keptJobs = {
	/** The saved organizations, as organizations. */
	get companies() {
		return companies;
	},
	/** Their jobs, by organization key (read when first asked). */
	get jobs() {
		read();
		return jobs;
	},
	/** All of them, newest first. */
	get all() {
		read();
		return all;
	},
	/** Still reading their boards. */
	get reading() {
		read();
		return reading;
	}
};
