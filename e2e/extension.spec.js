import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';

/**
 * The add-on's popup (extension/dist, built by test:e2e), on a website, with the browser's
 * add-on API standing in: it reads the page, saves and tags the organization as changes for
 * joblist.today. Whether joblist knows it is asked of the published snapshot.
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
	await page.goto(popup);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Acme Design Coop');
	await expect(page.locator('dl')).toContainText('Lever · acme-design');
	await expect(page.locator('dl')).toContainText('Instagram · Bluesky');
	await expect(page.getByRole('link', { name: 'Suggest to joblist' })).toHaveAttribute('href', /\/add\?url=https%3A%2F%2Fwww\.acme-design\.coop/);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByLabel('Add a tag').fill('Design');
	await page.getByLabel('Add a tag').press('Enter');
	await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
	const changes = await page.evaluate(() => /** @type {any} */ (window).store.changes);
	expect(changes.map((/** @type {any} */ c) => [c.op, c.url, c.tags])).toEqual([
		['keep', 'https://www.acme-design.coop', []],
		['tags', 'https://www.acme-design.coop', ['Design']]
	]);
});
