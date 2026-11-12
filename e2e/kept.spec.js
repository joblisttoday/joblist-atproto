import { expect, test } from '@playwright/test';

/**
 * One search for jobs and organizations (QuickSearch.svelte): a link or a domain opens its
 * organization's page, to keep it in this browser (or suggest it); a name offers those
 * joblist knows.
 */
/** @param {import('@playwright/test').Page} page @param {string} what */
async function search(page, what) {
	const input = page.locator('jl-search[inline] input');
	await input.fill(what);
	await input.press('Enter');
}

test('a link opens its organization, to keep; kept ones are remembered', async ({ page }) => {
	await page.goto('/');
	await search(page, 'instagram.com/some.coop');
	await expect(page).toHaveURL(/\/me\/organization#url=https%3A%2F%2Finstagram\.com%2Fsome\.coop/);
	await page.getByRole('button', { name: 'Save', exact: true }).first().click();
	await page.goto('/');
	await search(page, 'gitlab.com');
	await expect(page).toHaveURL(/\/gitlab\.com$/);
	await expect(page.locator('h1')).toContainText('GitLab');
	await page.getByRole('button', { name: 'Save', exact: true }).first().click();
	await page.goto('/');
	const items = page.locator('jl-kept-organizations li');
	await expect(items).toHaveCount(2);
	await expect(items.first()).toContainText('GitLab');
	await page.reload();
	await expect(items).toHaveCount(2);
});

test('words offer the saved organizations they name, and search their jobs', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('joblist.kept.v1', JSON.stringify([{ url: 'https://gitlab.com', name: 'GitLab', at: '2026-11-01T00:00:00Z' }])));
	await page.goto('/');
	await page.locator('jl-search[inline] input').fill('gitlab');
	await expect(page.locator('jl-search').getByRole('link', { name: /GitLab/ })).toBeVisible();
	await page.locator('jl-search[inline] input').press('Enter');
	await expect(page).toHaveURL(/\/jobs#q=gitlab/);
});

test('a kept organization joblist does not know opens its profile, to forget or suggest it', async ({ page }) => {
	await page.goto('/');
	await search(page, 'instagram.com/some.coop');
	await page.getByRole('button', { name: 'Save', exact: true }).first().click();
	await page.goto('/');
	await page.locator('jl-kept-organizations li a').first().click();
	await expect(page).toHaveURL(/\/me\/organization#url=/);
	await expect(page.getByRole('link', { name: 'Your organization? Describe it' })).toHaveAttribute('href', /^\/add\?url=https%3A%2F%2Finstagram\.com%2Fsome\.coop/);
	await page.getByRole('button', { name: 'Saved' }).first().click();
	await expect(page.getByRole('button', { name: 'Save', exact: true }).first()).toBeVisible();
});
