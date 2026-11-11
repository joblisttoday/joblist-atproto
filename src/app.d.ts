// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// What the explorer has open, as a history entry: back closes it.
		interface PageState {
			job?: import('#lib/ats/job.js').Job;
			picked?: string[];
			/** The job open came from a link to it: closing it stays on the page. */
			linked?: boolean;
		}
		// interface Platform {}
	}
}

// WebMCP declarative tools: https://developer.chrome.com/docs/ai/webmcp/declarative-api
declare module 'svelte/elements' {
	interface HTMLFormAttributes {
		toolname?: string;
		tooldescription?: string;
		toolautosubmit?: boolean;
	}
	interface HTMLAttributes<T> {
		toolparamdescription?: string;
	}
}

export {};
