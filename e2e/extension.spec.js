import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';

/**
 * The add-on's popup (extension/dist, built by test:e2e), on a website, with the browser's
 * add-on API standing in: it reads the page, saves and tags the organization as changes for
 * joblist.today, with its job board; its jobs are read from that board.
 */
const popup = pathToFileURL(`${process.cwd()}/extension/dist/popup.html`).href;
const coop = {
	url: 'https://www.acme-design.coop/',
	title: 'Acme Design Coop — Home',
	metas: { 'og:description': 'A worker-owned design studio.' },
	links: ['https://www.instagram.com/acmedesign.coop/', 'https://bsky.app/profile/acme-design.coop', 'https://jobs.lever.co/acme-design']
};

test('the popup reads a website, saves and tags it in this browser', async ({ page }) => {
	await page.addInitScript((fixture) => {
		/** @type {Record<string, any>} */
		const store = {};
		Object.assign(window, { store });
		Object.assign(globalThis, {
			browser: {
				tabs: { query: async () => [{ id: 1, url: fixture.url }], get: async () => ({ id: 1 }), create: async () => {}, sendMessage: async () => {} },
				scripting: { executeScript: async () => [{ result: fixture }] },
				storage: { local: { get: async (/** @type {string[]} */ keys) => Object.fromEntries([keys].flat().map((k) => [k, store[k]])), set: async (/** @type {object} */ o) => Object.assign(store, o) } }
			}
		});
	}, coop);
	// As a browser measures a popup: almost no room. It keeps its own width, never the viewport's.
	await page.setViewportSize({ width: 20, height: 600 });
	await page.goto(popup);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Acme Design Coop');
	expect(await page.evaluate(() => document.body.getBoundingClientRect().width)).toBeGreaterThan(300);
	await page.setViewportSize({ width: 400, height: 700 });
	await expect(page.locator('dl')).toContainText('Lever · acme-design');
	await expect(page.locator('dl')).toContainText('Instagram · Bluesky');
	await expect(page.getByRole('link', { name: 'Open on joblist' })).toHaveAttribute('href', 'https://joblist.today/acme-design.coop');
	await page.getByRole('button', { name: 'Follow' }).click();
	await page.getByLabel('Add a tag').fill('Design');
	await page.getByLabel('Add a tag').press('Enter');
	await expect(page.getByRole('button', { name: 'Following' })).toBeVisible();
	const changes = await page.evaluate(() => /** @type {any} */ (window).store.changes);
	expect(changes.map((/** @type {any} */ c) => [c.op, c.url, c.tags])).toEqual([
		['keep', 'https://acme-design.coop', []],
		['tags', 'https://acme-design.coop', ['Design']]
	]);
	expect(changes[0].board).toEqual({ provider: 'lever', id: 'acme-design' });
});

test('/apps offers the add-on, packed with the site, and how to try it', async ({ page, request }) => {
	await page.goto('/apps');
	const download = page.getByRole('link', { name: 'Download the add-on' });
	await expect(download).toHaveAttribute('href', '/apps/joblist-firefox.zip');
	const file = await request.get('/apps/joblist-firefox.zip');
	expect(file.ok()).toBe(true);
	const bytes = await file.body();
	// a zip ("PK"), with the manifest in it
	expect(bytes.subarray(0, 2).toString()).toBe('PK');
	expect(bytes.includes(Buffer.from('manifest.json'))).toBe(true);
	await expect(page.getByText('about:debugging#/runtime/this-firefox')).toBeVisible();
});

test('the popup counts the jobs matching your saved searches (copied from joblist.today)', async ({ page }) => {
	const gitlab = { url: 'https://about.gitlab.com/jobs/', title: 'GitLab jobs', metas: {}, links: ['https://job-boards.greenhouse.io/gitlab'] };
	await page.addInitScript((fixture) => {
		/** @type {Record<string, any>} */
		const store = { searches: [{ query: 'product', where: '', remote: '' }] };
		Object.assign(globalThis, {
			browser: {
				tabs: { query: async () => [{ id: 1, url: fixture.url }], get: async () => ({ id: 1 }), create: async () => {}, sendMessage: async () => {} },
				scripting: { executeScript: async () => [{ result: fixture }] },
				storage: { local: { get: async (/** @type {string[]} */ keys) => Object.fromEntries([keys].flat().map((k) => [k, store[k]])), set: async (/** @type {object} */ o) => Object.assign(store, o) } }
			}
		});
	}, gitlab);
	await page.setViewportSize({ width: 400, height: 700 });
	await page.goto(popup);
	await expect(page.locator('.status')).toContainText(/\d+ matching your searches/, { timeout: 20_000 });
});
