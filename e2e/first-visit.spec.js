import { expect, test } from '@playwright/test';

/**
 * joblist keeps no list of organizations or jobs: a first visit has nothing to browse. The
 * home says what it is for, with two doors (looking for work, hiring); once an organization
 * is followed, the home is its jobs.
 */
test('a first visit has two doors, and the home is Jobs once one organization is followed', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Follow the jobs of organizations you choose');
	await expect(page.getByRole('heading', { name: 'Looking for work?' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Publish your careers page/ })).toHaveAttribute('href', '/organization');
	await page.getByPlaceholder('Paste a website or a job board').fill('gitlab.com');
	await page.getByPlaceholder('Paste a website or a job board').press('Enter');
	await expect(page).toHaveURL(/\/gitlab\.com$/);
	await page.getByRole('button', { name: 'Follow', exact: true }).first().click();
	await expect(page.getByRole('status').filter({ hasText: 'Following GitLab' })).toBeVisible();
	await page.goto('/');
	await expect(page.locator('jl-explore')).toBeVisible();
	await page.goto('/following');
	await expect(page.locator('jl-kept-organizations li')).toHaveCount(1);
});

test('the tabs say what is there: Jobs, Following, Saved, Menu', async ({ page }) => {
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Main' });
	await expect(nav.getByRole('link')).toHaveText([/Jobs/, /Following/, /Saved/, /Menu/]);
	await page.goto('/jobs#q=design');
	await expect(page).toHaveURL(/\/#q=design$/);
});

test('the menu is short, and signing in is for organizations', async ({ page }) => {
	await page.goto('/menu');
	const rows = page.locator('jl-menu-page menu > li');
	await expect(rows).toHaveCount(5);
	await rows.first().getByRole('link', { name: /Hiring/ }).click();
	await expect(page).toHaveURL(/\/organization$/);
	await expect(page.locator('ol li')).toHaveCount(3);
	await expect(page.getByPlaceholder('example.org')).toBeVisible();
});
