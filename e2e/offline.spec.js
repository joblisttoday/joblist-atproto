import { expect, test } from '@playwright/test';

/**
 * Local-first: once read, joblist opens and searches offline (src/service-worker.js,
 * the network cache in IndexedDB), its pages included.
 */
test.use({ serviceWorkers: 'allow' });

test('opens, shows its jobs and an organization offline, on what it read last', async ({ page, context }) => {
	await page.goto('/jobs#view=list');
	await page.evaluate(() => navigator.serviceWorker.ready);
	// Controlled by the service worker from now on: what is read is kept.
	await page.reload();
	await expect(page.locator('jl-job').first()).toBeVisible({ timeout: 30_000 });
	await page.goto('/company/ableton.com');
	await expect(page.locator('h1')).toContainText('Ableton');

	await context.setOffline(true);
	await page.goto('/jobs#view=list');
	await expect(page.locator('jl-job').first()).toBeVisible({ timeout: 30_000 });
	await expect(page.locator('jl-outbox-status[state="offline"]')).toBeVisible();
	await page.goto('/company/ableton.com');
	await expect(page.locator('h1')).toContainText('Ableton');
	await page.goto('/lists');
	await expect(page.locator('h1')).toBeVisible();
});
