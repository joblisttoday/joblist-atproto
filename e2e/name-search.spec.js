import { expect, test } from '@playwright/test';

/**
 * Starting from a name (src/lib/network/name-search.js): a name at a provider opens that
 * board with no request; a name alone, after a pause, asks Wikidata and Bluesky (live) for
 * the organizations and accounts it may be.
 */
test('a name at a provider offers its board', async ({ page }) => {
	await page.goto('/');
	await page.getByPlaceholder('Paste a website or a job board').fill('gitlab greenhouse');
	await expect(page.getByRole('link', { name: 'gitlab on Greenhouse' })).toBeVisible();
});

test('a name offers the organizations it may be, with their website, and says where it was asked', async ({ page }) => {
	await page.goto('/');
	await page.getByPlaceholder('Paste a website or a job board').fill('Ableton');
	await expect(page.locator('jl-search ul a[href="/ableton.com"]')).toBeVisible({ timeout: 15000 });
	await expect(page.locator('jl-search')).toContainText('Wikidata');
	await page.locator('jl-search ul a[href="/ableton.com"]').click();
	await expect(page).toHaveURL(/\/ableton\.com$/);
	await expect(page.locator('h1')).toContainText('Ableton', { timeout: 15000 });
});
