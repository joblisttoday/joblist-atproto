import webmcp from '#lib/data/webmcp.json';
import { keptJobs } from '#lib/network/kept-jobs.svelte.js';
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
	// The organizations saved in this browser, and their jobs read live from their boards.
	search_companies: async (args) => searchCompanies(new Map(keptJobs.companies.map((c) => [c.key, c])), args, location.origin),
	search_jobs: async (args) => {
		const companies = new Map(keptJobs.companies.map((c) => [c.key, c]));
		return searchJobs(mergeJobs([...data.postedJobs.values()].flat(), keptJobs.all), companies, args);
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
	// document.modelContext, as the spec names it now; navigator.modelContext in older Chromes.
	const context = /** @type {any} */ (document).modelContext || /** @type {any} */ (navigator).modelContext;
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
