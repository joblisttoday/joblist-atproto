import { expect, test } from '@playwright/test';

/**
 * WebMCP (src/lib/webmcp.js), without a browser that has it: the page is given a stand-in
 * document.modelContext that keeps what joblist registers, and the tools are called as an
 * AI assistant in the browser would.
 */
test('registers read-only tools that an assistant can call', async ({ page }) => {
	await page.addInitScript(() => {
		/** @type {Record<string, any>} */
		const tools = {};
		Object.defineProperty(document, 'modelContext', { value: { registerTool: (/** @type {any} */ tool) => (tools[tool.name] = tool) } });
		Object.defineProperty(window, '__tools', { value: tools });
		localStorage.setItem('joblist.kept.v1', JSON.stringify([{ url: 'https://gitlab.com', name: 'GitLab', at: '2026-11-01T00:00:00Z', board: { provider: 'greenhouse', id: 'gitlab' } }]));
	});
	await page.goto('/');
	await expect.poll(() => page.evaluate(() => Object.keys(/** @type {any} */ (window).__tools).sort())).toEqual(['search_companies', 'search_jobs']);
	const annotations = await page.evaluate(() => /** @type {any} */ (window).__tools.search_jobs.annotations);
	expect(annotations.readOnlyHint).toBe(true);

	// The saved organizations, then their jobs, as an assistant would ask.
	await expect
		.poll(async () => JSON.parse(await page.evaluate(() => /** @type {any} */ (window).__tools.search_companies.execute({ query: 'gitlab' }))).total, { timeout: 30_000 })
		.toBeGreaterThan(0);
	const companies = JSON.parse(await page.evaluate(() => /** @type {any} */ (window).__tools.search_companies.execute({ query: 'gitlab' })));
	expect(companies.companies[0].name).toBe('GitLab');
	await expect
		.poll(async () => JSON.parse(await page.evaluate(() => /** @type {any} */ (window).__tools.search_jobs.execute({ query: '' }))).total, { timeout: 30_000 })
		.toBeGreaterThan(0);
});
