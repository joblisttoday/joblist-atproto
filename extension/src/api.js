/** The browser's extension API: Firefox's `browser`, else Chrome's `chrome` (both answer with promises). */
// @ts-ignore
export const api = globalThis.browser ?? globalThis.chrome;
