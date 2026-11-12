import { expect, test } from '@playwright/test';

/**
 * A page that lists jobs opens one in a dialog over the list, with its link in the address;
 * back closes it, and a link to it opens it again. Here the jobs of a saved organization,
 * read live from its board.
 */
test('the jobs page opens a job in a dialog, back closes it, its link opens it', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('joblist.kept.v1', JSON.stringify([{ url: 'https://gitlab.com', name: 'GitLab', at: '2026-11-01T00:00:00Z', board: { provider: 'greenhouse', id: 'gitlab' } }])));
	await page.goto('/jobs#view=list');
	await page.locator('jl-job button').first().click({ timeout: 20_000 });
	const dialog = page.locator('dialog[open]');
	await expect(dialog).toBeVisible();
	expect(page.url()).toMatch(/[#&]job=/);
	const link = page.url();
	await page.goBack();
	await expect(dialog).toHaveCount(0);
	// A link someone shared: opened fresh.
	await page.goto('about:blank');
	await page.goto(link);
	await expect(dialog).toBeVisible({ timeout: 20_000 });
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
	expect(page.url()).not.toMatch(/[#&]job=/);
});

test('a job of a followed organization shows its description, and can be saved', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('joblist.kept.v1', JSON.stringify([{ url: 'https://gitlab.com', name: 'GitLab', at: '2026-11-01T00:00:00Z', board: { provider: 'greenhouse', id: 'gitlab' } }])));
	await page.goto('/jobs#view=list');
	await page.locator('jl-job button').first().click({ timeout: 20_000 });
	const dialog = page.locator('dialog[open]');
	await expect(dialog.locator('jl-job-description p').first()).not.toContainText(/no description|Reading/, { timeout: 20_000 });
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(dialog.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
	await page.goto('/jobs/saved');
	await expect(page.locator('main')).toContainText('1 job');
});

test("a job posted on atproto has its page, where it can be saved", async ({ page }) => {
	await page.goto('/job/did:plc:jqaucxlucukeif3bltpuc7zx/3n24bcwmxy2qi');
	const save = page.getByRole('button', { name: 'Save', exact: true });
	await expect(save).toBeVisible({ timeout: 20_000 });
	await save.click();
	await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
	await page.goto('/jobs/saved');
	await expect(page.locator('main')).toContainText('1 job');
});
