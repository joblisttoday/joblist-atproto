import { expect, test } from '@playwright/test';

/**
 * The embed (embed/dist, served at /embed/joblist-jobs.js) on its own page, as on another
 * site: given a board, it reads it live, with nothing in between. Live boards: the jobs
 * shown are whatever is open now.
 */
const items = (/** @type {import('@playwright/test').Page} */ page) => page.locator('joblist-jobs').locator('li');

test('given its board, it shows the organization jobs read live, and its name', async ({ page }) => {
	await page.goto('/embed/?board=greenhouse:gitlab&limit=5');
	await expect(items(page).first()).toBeVisible({ timeout: 15000 });
	expect(await items(page).count()).toBe(5);
	await expect(page.locator('joblist-jobs').locator('h2')).toContainText('GitLab');
	await expect(items(page).first().locator('a')).toHaveAttribute('href', /^https:\/\/(job-boards|boards)\.greenhouse\.io\//);
});

test('without a board, it says it cannot show jobs', async ({ page }) => {
	await page.goto('/embed/?board=not-a-board');
	await expect(page.locator('joblist-jobs').locator('p')).toBeVisible({ timeout: 15000 });
	expect(await items(page).count()).toBe(0);
});

test('given an organization on atproto, it shows its own name, linked to its page', async ({ page }) => {
	await page.goto('/embed/?organization=joblist.today');
	const title = page.locator('joblist-jobs').locator('h2 a');
	await expect(title).toContainText('joblist', { timeout: 15000 });
	await expect(title).toHaveAttribute('href', /\/joblist\.today$/);
	await expect(page.locator('joblist-jobs').locator('p').first()).toBeVisible();
});
