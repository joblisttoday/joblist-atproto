import { expect, test } from '@playwright/test';

/** Keeping organizations by any link, in this browser: one joblist knows shows its jobs. */
test('keeps any link, recognizes an organization joblist knows, and remembers them', async ({ page }) => {
	await page.goto('/me/organizations');
	const link = page.getByLabel(/^Link/);
	const keep = page.getByRole('button', { name: 'Keep' });
	await link.fill('instagram.com/some.coop');
	await page.getByLabel('Name (optional)').fill('Some Coop');
	await keep.click();
	await link.fill('gitlab.com');
	await keep.click();
	await link.fill('not a link');
	await keep.click();
	await expect(page.getByRole('alert')).toBeVisible();
	const items = page.locator('jl-kept-organizations li');
	await expect(items).toHaveCount(2);
	await expect(items.first()).toContainText('GitLab');
	await expect(items.nth(1)).toContainText('Some Coop');
	await page.reload();
	await expect(items).toHaveCount(2);
});
