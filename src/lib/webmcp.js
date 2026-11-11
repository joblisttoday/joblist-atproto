import webmcp from '#lib/data/webmcp.json';
import { getSnapshotJobs } from '#lib/network/snapshot.js';
import { mergeJobs } from '#lib/models/job-post.js';
import { data } from '#lib/network/network.svelte.js';
import { searchCompanies, searchJobs } from './webmcp-tools.js';

/**
 * Read-only WebMCP tools (https://developer.chrome.com/docs/ai/webmcp), for
 * browsers that offer them; the add forms are declarative tools too.
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
		return searchJobs(mergeJobs(posted, snapshot.all), data.companies, args);
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
