import { expect, test } from '@playwright/test';

/**
 * What joblist does, on the built site (reads joblist.today's own atproto account, live):
 * explain; open an organization's page; sign in; its jobs; its embed; settings; nothing else.
 */

test('the home says what joblist does, how it works, and leads to signing in', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('joblist');
	await page.getByRole('link', { name: 'How it works' }).click();
	await expect(page).toHaveURL(/\/about$/);
	await page.goto('/');
	await page.getByRole('main').getByRole('link', { name: 'Sign in' }).click();
	await expect(page).toHaveURL(/\/signin$/);
	await expect(page.getByLabel('Handle')).toBeVisible();
});

test('search, on the home: organizations on joblist, found through the network; a domain opens its page', async ({ page }) => {
	await page.goto('/');
	const box = page.getByRole('searchbox', { name: 'Search organizations and jobs' });
	await box.fill('joblist');
	await expect(page.getByRole('link', { name: /joblist\.today/ }).first()).toBeVisible({ timeout: 30_000 });
	await box.fill('https://joblist.today/');
	await box.press('Enter');
	await expect(page).toHaveURL(/\/joblist\.today$/);
});

// An account whose handle is its domain, with no joblist records: its page says so. (A domain
// that resolves today, not joblist.today: its handle depends on its own site being up.)
test("an organization's page is read from its own account: who it is, its open jobs", async ({ page }) => {
	await page.goto('/bsky.app');
	await expect(page.getByRole('heading', { name: 'Open jobs' })).toBeVisible({ timeout: 20_000 });
	await expect(page.locator('h1')).toHaveText('bsky.app');
	await expect(page.getByText('Not described yet.')).toBeVisible();
	await expect(page.getByText('No open jobs right now.')).toBeVisible();
	// Its menu: to share it; not its own, none of its tools.
	await page.getByRole('button', { name: 'More' }).click();
	await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Post a job' })).toHaveCount(0);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: 'Share' })).toHaveCount(0);
});

test('a domain no account has as its handle is no organization here', async ({ page }) => {
	await page.goto('/example-not-on-joblist.org');
	await expect(page.getByText('No organization uses joblist as example-not-on-joblist.org')).toBeVisible({ timeout: 20_000 });
});

test("an organization's tools are its own account's: anyone else is asked to sign in as it", async ({ page }) => {
	for (const path of ['/joblist.today/post', '/joblist.today/edit']) {
		await page.goto(path);
		await expect(page.getByText('sign in as @joblist.today')).toBeVisible();
		await expect(page.getByLabel('Handle')).toBeVisible();
	}
});

test('settings: signing in, the language on its own page, the source', async ({ page }) => {
	await page.goto('/settings');
	await expect(page.getByRole('main').getByRole('link', { name: 'Sign in' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Source code' })).toHaveAttribute('href', /github\.com/);
	await page.getByRole('link', { name: 'About' }).click();
	await expect(page.locator('main section h2')).toHaveCount(4);
	await page.goto('/settings');
	await page.getByRole('link', { name: /Language/ }).click();
	await expect(page).toHaveURL(/\/settings\/language$/);
	await page.getByLabel('français').check();
	await expect(page.locator('h1')).toHaveText('Langue');
	await page.getByRole('link', { name: 'Réglages' }).first().click();
	await expect(page.getByRole('link', { name: /Langue/ })).toContainText('français');
});

test('its jobs on any website: a line to paste, and the frame it opens', async ({ page }) => {
	await page.goto('/joblist.today/embed');
	await expect(page.locator('pre')).toHaveCount(2);
	await expect(page.locator('pre').last()).toContainText('<joblist-jobs organization="joblist.today">');
	await page.goto('/embed/?organization=bsky.app');
	await expect(page.locator('joblist-jobs').locator('h2')).toContainText('bsky.app', { timeout: 20_000 });
	await expect(page.locator('joblist-jobs')).toContainText('No open jobs right now.');
});

test('static files and statuses, as GitHub Pages serves them', async ({ request }) => {
	expect((await request.get('/a/b/c')).status()).toBe(404);
	for (const path of ['/signin', '/settings', '/settings/language', '/about']) expect((await request.get(path)).status()).toBe(200);
	expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
	expect(await (await request.get('/llms.txt')).text()).toContain('today.joblist.job');
});
