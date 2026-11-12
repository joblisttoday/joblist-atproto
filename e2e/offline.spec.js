import { expect, test } from '@playwright/test';

/**
 * Local-first: once opened, joblist opens offline (src/service-worker.js), with what is kept
 * in this browser: the organizations saved, the organization pages read before (IndexedDB).
 */
test.use({ serviceWorkers: 'allow' });

test('opens offline, with what this browser keeps', async ({ page, context }) => {
	await page.goto('/joblist.today');
	await page.evaluate(() => navigator.serviceWorker.ready);
	// Controlled by the service worker from now on.
	await page.reload();
	await expect(page.locator('h1')).toContainText('joblist', { timeout: 20_000 });

	await context.setOffline(true);
	await page.goto('/menu');
	await expect(page.locator('h1')).toBeVisible();
	await expect(page.locator('jl-outbox-status[state="offline"]')).toBeVisible();
	await page.goto('/jobs');
	await expect(page.locator('main')).toBeAttached();
});
