import { expect, test } from '@playwright/test';

/**
 * Jobs is made from the jobs read: a choice they cannot answer is left out. Jobs read from
 * boards have no place on the map (the snapshot placed them, before): no map, no "Near me";
 * "Remote" when some are remote.
 */
for (const [device, use] of /** @type {const} */ ([
	['phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }],
	['desktop', { viewport: { width: 1440, height: 900 } }]
])) {
	test.describe(`Jobs from the data (${device})`, () => {
		test.use(use);
		test('no map and no "Near me" when no job has a place', async ({ page }) => {
			await page.addInitScript(() => localStorage.setItem('joblist.kept.v1', JSON.stringify([{ url: 'https://gitlab.com', name: 'GitLab', at: '2026-11-01T00:00:00Z', board: { provider: 'greenhouse', id: 'gitlab' } }])));
			await page.goto('/jobs');
			await expect(page.locator('jl-job').first()).toBeVisible({ timeout: 20_000 });
			await expect(page.locator('jl-explore-bar').getByRole('button', { name: /Remote/ })).toBeVisible();
			await expect(page.locator('jl-explore-bar').getByRole('button', { name: /Near me/ })).toHaveCount(0);
			await expect(page.locator('jl-explore-map')).toBeHidden();
		});
	});
}

test('nothing followed: how to start, no filters', async ({ page }) => {
	await page.goto('/jobs');
	await expect(page.getByRole('heading', { name: 'Find organizations to follow' })).toBeVisible();
	await expect(page.locator('jl-explore-bar')).toHaveCount(0);
});
