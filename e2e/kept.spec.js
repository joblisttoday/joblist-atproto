import { expect, test } from '@playwright/test';

/**
 * Collecting organizations (Collect.svelte), in this browser: any link, a domain or a name;
 * one joblist knows shows its jobs; one it does not know opens its profile, to suggest.
 */
/** @param {import('@playwright/test').Page} page @param {string} what */
async function collect(page, what) {
	const input = page.getByLabel(/^An organization/);
	await input.fill(what);
	await input.press('Enter');
}

test('collects any link, recognizes an organization joblist knows, and remembers them', async ({ page }) => {
	await page.goto('/me/organizations');
	await collect(page, 'instagram.com/some.coop');
	await expect(page.locator('jl-collect-found')).toContainText('Not on joblist yet');
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	await collect(page, 'gitlab.com');
	await expect(page.locator('jl-collect-found')).toContainText('On joblist');
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	const items = page.locator('jl-kept-organizations li');
	await expect(items).toHaveCount(2);
	await expect(items.first()).toContainText('GitLab');
	await page.reload();
	await expect(items).toHaveCount(2);
});

test('finds an organization by its name', async ({ page }) => {
	await page.goto('/');
	await collect(page, 'gitlab');
	await expect(page.locator('jl-collect').getByRole('link', { name: 'GitLab', exact: true })).toBeVisible();
});

test('a kept organization joblist does not know opens its profile, to forget or suggest it', async ({ page }) => {
	await page.goto('/me/organizations');
	await collect(page, 'instagram.com/some.coop');
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	await page.locator('jl-kept-organizations li a').first().click();
	await expect(page).toHaveURL(/\/me\/organization#url=/);
	await expect(page.getByRole('link', { name: 'Suggest to joblist' })).toHaveAttribute('href', /^\/add\?url=https%3A%2F%2Finstagram\.com%2Fsome\.coop/);
	await page.getByRole('button', { name: 'Saved' }).click();
	await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
});
