import { expect, test } from '@playwright/test';

/**
 * Every page that lists jobs opens one in a dialog over the list, with its link in the
 * address; back closes it, and a link to it opens it again.
 */
test('a city page opens a job in a dialog, back closes it, its link opens it', async ({ page }) => {
	await page.goto('/in');
	await page.locator('main a[href^="/in/"]').first().click();
	await page.locator('jl-landing-page li button').first().click();
	const dialog = page.locator('dialog[open]');
	await expect(dialog).toBeVisible();
	expect(page.url()).toContain('#job=');
	const link = page.url();
	await page.goBack();
	await expect(dialog).toHaveCount(0);
	// A link someone shared: opened fresh.
	await page.goto('about:blank');
	await page.goto(link);
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
	expect(page.url()).not.toContain('#job=');
});
