import { expect, test } from '@playwright/test';

/**
 * joblist keeps no list of organizations or jobs: a first visit has nothing to browse. The
 * home asks for an organization, and the Jobs tab comes once one is saved.
 */
test('a first visit is asked for an organization, and Jobs comes once one is saved', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Follow the jobs of organizations you choose');
	const nav = page.getByRole('navigation', { name: 'Main' });
	await expect(nav.getByRole('link', { name: 'Jobs' })).toHaveCount(0);
	await page.getByPlaceholder('Paste a website or a job board').fill('gitlab.com');
	await page.getByPlaceholder('Paste a website or a job board').press('Enter');
	await expect(page).toHaveURL(/\/gitlab\.com$/);
	await page.getByRole('button', { name: 'Save', exact: true }).first().click();
	await expect(nav.getByRole('link', { name: 'Jobs' })).toBeVisible();
	await page.goto('/');
	await expect(page.getByPlaceholder('Search your jobs, or paste a link')).toBeVisible();
	await expect(page.locator('jl-kept-organizations li')).toHaveCount(1);
});

test('the menu is short, and signing in is for organizations', async ({ page }) => {
	await page.goto('/menu');
	const rows = page.locator('jl-menu-page menu > li');
	await expect(rows).toHaveCount(5);
	await rows.first().getByRole('link', { name: 'For organizations' }).click();
	await expect(page).toHaveURL(/\/organization$/);
	await expect(page.locator('ol li')).toHaveCount(3);
	await expect(page.getByPlaceholder('example.org')).toBeVisible();
});
