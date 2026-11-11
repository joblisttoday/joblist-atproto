import { expect, test } from '@playwright/test';

/**
 * The embed (embed/dist, served at /embed/joblist-jobs.js) on its own page, as on another
 * site: given a board, it reads it live, with no index; given a domain, an index says its
 * board. Live boards and the published index: the jobs shown are whatever is open now.
 */
const items = (/** @type {import('@playwright/test').Page} */ page) => page.locator('joblist-jobs').locator('li');

test('given its board, it shows the organization jobs read live, and its name', async ({ page }) => {
	await page.goto('/embed/?board=greenhouse:gitlab&limit=5');
	await expect(items(page).first()).toBeVisible({ timeout: 15000 });
	expect(await items(page).count()).toBe(5);
	await expect(page.locator('joblist-jobs').locator('h2')).toContainText('GitLab');
	await expect(items(page).first().locator('a')).toHaveAttribute('href', /^https:\/\/(job-boards|boards)\.greenhouse\.io\//);
});

test('given its domain, it finds its board in the index, and says when it cannot', async ({ page }) => {
	await page.goto('/embed/?company=gitlab.com&limit=3');
	await expect(items(page).first()).toBeVisible({ timeout: 15000 });
	await page.goto('/embed/?company=not-a-domain');
	await expect(page.locator('joblist-jobs').locator('p')).toBeVisible();
	expect(await items(page).count()).toBe(0);
});
