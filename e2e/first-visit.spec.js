import { expect, test } from '@playwright/test';

/**
 * joblist keeps no list of organizations or jobs: a first visit has nothing to browse. The
 * home says what it is for, with two doors (looking for work, hiring); once an organization
 * is followed, the home is its jobs.
 */
test('a first visit has two doors, and the home is Explore once one organization is followed', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Follow the jobs of organizations you choose');
	await expect(page.getByRole('heading', { name: 'Looking for work?' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Publish your careers page/ })).toHaveAttribute('href', '/org');
	await page.getByPlaceholder('Paste a website or a job board').fill('gitlab.com');
	await page.getByPlaceholder('Paste a website or a job board').press('Enter');
	await expect(page).toHaveURL(/\/gitlab\.com$/);
	await page.getByRole('button', { name: 'Follow', exact: true }).first().click();
	await expect(page.getByRole('status').filter({ hasText: 'Following GitLab' })).toBeVisible();
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Explore');
	await expect(page.locator('jl-kept-organizations jl-row')).toHaveCount(1);
	await page.goto('/jobs');
	await expect(page.locator('jl-explore')).toBeVisible();
});

test('the tabs say what is there: Explore, Jobs, Saved, Menu', async ({ page }) => {
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Main' });
	await expect(nav.getByRole('link')).toHaveText([/Explore/, /Jobs/, /Saved/, /Menu/]);
	await page.goto('/following');
	await expect(page).toHaveURL(/\/$/);
});

test('the menu is short, and signing in is for organizations', async ({ page }) => {
	await page.goto('/menu');
	const rows = page.locator('jl-menu-page menu > li');
	await expect(rows).toHaveCount(6);
	await expect(rows.first()).toContainText('This device');
	await rows.nth(1).getByRole('link', { name: /Hiring/ }).click();
	await expect(page).toHaveURL(/\/org$/);
	await expect(page.locator('ol li')).toHaveCount(3);
	await expect(page.getByPlaceholder('example.org')).toBeVisible();
});

test('who you are: this device, with no account, private', async ({ page }) => {
	await page.goto('/menu');
	await page.locator('jl-menu-page').getByRole('link', { name: /^Account/ }).click();
	await expect(page).toHaveURL(/\/menu\/accounts$/);
	await expect(page.locator('jl-accounts jl-row:first-of-type')).toContainText('This device');
	await expect(page.getByRole('link', { name: 'Add an account' })).toHaveAttribute('href', /\/signin\?add/);
});

test("an organization's pages are its account's: signed out, they lead to how to sign in", async ({ page }) => {
	for (const path of ['/org/post', '/org/embed', '/org/jobs/3abc']) {
		await page.goto(path);
		await expect(page).toHaveURL(/\/org$/);
		await expect(page.locator('ol li')).toHaveCount(3);
	}
	// Describing one's organization says how, to anyone: "Is this your organization?" leads there.
	await page.goto('/org/page?url=https%3A%2F%2Fexample.org');
	await expect(page).toHaveURL(/\/org\/page\?url=/);
});

test('old addresses lead to the new ones, with what follows the "#"', async ({ page }) => {
	for (const [from, to] of [
		['/organization', /\/org$/],
		['/jobs/new', /\/org\/post$/],
		['/apps', /\/menu\/apps$/],
		['/me/lists/saved', /\/saved\/saved$/],
		['/following/list#url=https%3A%2F%2Fbsky.app%2Fprofile%2Fjoblist.today%2Ffollows', /\/explore\/list#url=/]
	]) {
		await page.goto(from);
		await expect(page).toHaveURL(to);
	}
});

test('switching accounts happens in place: the app does not reload', async ({ page }) => {
	await page.addInitScript(() => {
		if (!sessionStorage.getItem('seeded')) {
			sessionStorage.setItem('seeded', '1');
			localStorage.setItem('joblist.accounts.v1', JSON.stringify({ current: null, list: [{ did: 'did:plc:jqaucxlucukeif3bltpuc7zx', handle: 'joblist.today' }] }));
		}
	});
	await page.goto('/menu/accounts');
	await page.evaluate(() => (/** @type {any} */ (window).stayed = true));
	const row = page.locator('jl-accounts jl-row').nth(1);
	await row.getByRole('button').click();
	await page.getByRole('button', { name: 'Use' }).click();
	await page.waitForTimeout(1500);
	expect(await page.evaluate(() => /** @type {any} */ (window).stayed)).toBe(true);
});
