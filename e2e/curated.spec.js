import { expect, test } from '@playwright/test';

/**
 * Following a list someone curates on Bluesky (src/lib/network/curated.js): its accounts with
 * a domain of their own, followed here privately, tagged with its name. Live: the accounts
 * joblist.today follows.
 */
test('a pasted list offers its organizations, followed at once and tagged', async ({ page }) => {
	await page.goto('/following');
	const box = page.getByPlaceholder('Paste a website or a job board');
	await box.fill('https://bsky.app/profile/joblist.today/follows');
	await expect(page.getByRole('link', { name: 'Follow the organizations of this list' })).toBeVisible();
	await box.press('Enter');
	await expect(page).toHaveURL(/\/following\/list#url=/);
	const follow = page.locator('jl-curated button[data-primary]');
	await expect(follow).toBeVisible({ timeout: 20_000 });
	const count = await page.locator('jl-curated li').count();
	expect(count).toBeGreaterThan(0);
	await follow.click();
	await expect(page).toHaveURL(/\/following$/);
	await expect(page.locator('jl-kept-organizations li')).toHaveCount(count);
	await expect(page.locator('jl-kept-organizations li').first()).toContainText('joblist-today');
});
