import webmcp from '#lib/data/webmcp.json';
import { getSnapshotJobs } from '#lib/network/snapshot.js';
import { loadList } from '#lib/network/load-list.js';
import { mergeJobs } from '#lib/models/job-post.js';
import { data, handleOf, membersOf } from '#lib/network/network.svelte.js';
import { listSummary, parseListUrl, searchCompanies, searchJobs } from './webmcp-tools.js';

/**
 * Read-only WebMCP tools (https://developer.chrome.com/docs/ai/webmcp), for
 * browsers that offer them; the add and list forms are declarative tools too.
 * Writing stays with the person: no tool saves anything.
 */

/** @type {Record<string, (args: any) => Promise<unknown>>} */
const handlers = {
	search_companies: async (args) => searchCompanies(data.companies, args, location.origin),
	search_jobs: async (args) => {
		const snapshot = await getSnapshotJobs();
		if (!snapshot) return { error: 'The jobs snapshot is not available right now; open /jobs to read job boards live.' };
		// Offers posted on joblist are read from their records, not the snapshot.
		const posted = [...data.postedJobs.values()].flat();
		return searchJobs(mergeJobs(posted, [...snapshot.jobs.values()].flat()), data.companies, args);
	},
	get_list: async ({ url }) => {
		const ref = parseListUrl(url);
		if (!ref) return { error: 'Not a joblist list link.' };
		const known = data.lists.find((l) => l.rkey === ref.rkey && (l.did === ref.actor || handleOf(l.did) === ref.actor));
		const list = known || (await loadList(ref.actor, ref.rkey).catch(() => null));
		if (!list) return { error: 'List not found.' };
		// Open lists include the companies others added.
		const companies = membersOf(list).members.map((m) => m.key);
		return listSummary({ ...list, companies }, data.companies, handleOf(list.did), location.origin);
	}
};

let registered = false;

/** Join the WebMCP origin trial when a token is configured (Chrome accepts injected tokens). */
function joinOriginTrial() {
	if (!webmcp.originTrialToken) return;
	const meta = document.createElement('meta');
	meta.httpEquiv = 'origin-trial';
	meta.content = webmcp.originTrialToken;
	document.head.append(meta);
}

/** Register the tools once, when the browser has WebMCP. */
export function registerTools() {
	if (!registered) joinOriginTrial();
	/** @type {any} */
	const context = /** @type {any} */ (document).modelContext;
	if (registered || !context?.registerTool) return;
	registered = true;
	for (const tool of webmcp.tools) {
		const handler = handlers[tool.name];
		// Answers carry what people wrote about companies: read-only, but not trusted.
		(async () =>
			context.registerTool({
				...tool,
				annotations: { readOnlyHint: true, untrustedContentHint: true },
				execute: async (/** @type {any} */ args) => JSON.stringify(await handler(args || {}))
			}))().catch(() => {});
	}
}
