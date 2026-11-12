import { expect, test } from '@playwright/test';

/**
 * joblist keeps no list of organizations or jobs: a first visit has nothing to browse. The
 * home says what it does and how, plainly, the same for everyone; once an organization is
 * followed, the home is its jobs.
 */
test('a first visit says how it works, and the home is Explore once one organization is followed', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Follow organizations, see their open jobs');
	await expect(page.locator('jl-welcome ol li')).toHaveCount(4);
	await expect(page.locator('jl-welcome ol').getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin');
	await page.getByLabel('Follow an organization').fill('gitlab.com');
	await page.getByLabel('Follow an organization').press('Enter');
	await expect(page).toHaveURL(/\/gitlab\.com$/);
	await page.getByRole('button', { name: 'Follow', exact: true }).first().click();
	await expect(page.getByRole('status').filter({ hasText: 'Following GitLab' })).toBeVisible();
	await page.goto('/');
	await expect(page.getByLabel('Find an organization or a job')).toBeVisible();
	await expect(page.locator('jl-kept-organizations jl-row')).toHaveCount(1);
	await page.goto('/companies');
	await expect(page.locator('jl-kept-organizations jl-row')).toHaveCount(1);
	await page.goto('/jobs');
	await expect(page.locator('jl-explore')).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Explore' }).getByRole('link')).toHaveText([/Organizations/, /Jobs/]);
});

test('the tabs say what is there: Home, Explore, Menu; Explore opens the part last used', async ({ page }) => {
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Main' });
	await expect(nav.getByRole('link')).toHaveText([/Home/, /Explore/, /Menu/]);
	await expect(nav.getByRole('link', { name: /Explore/ })).toHaveAttribute('href', '/jobs');
	await page.goto('/following');
	await expect(page).toHaveURL(/\/companies$/);
	await expect(nav.getByRole('link', { name: /Explore/ })).toHaveAttribute('href', '/companies');
});

test('the menu is short, and signing in is for organizations', async ({ page }) => {
	await page.goto('/menu');
	await expect(page.locator('jl-you')).toContainText('device.local');
	const rows = page.locator('jl-menu-page menu > li');
	await expect(rows).toHaveCount(5);
	await rows.first().getByRole('link', { name: /Sign in/ }).click();
	await expect(page).toHaveURL(/\/signin$/);
	await expect(page.locator('ol li')).toHaveCount(3);
	await expect(page.getByPlaceholder('example.org')).toBeVisible();
});

test('who you are: this device, its own profile, private and renamable', async ({ page }) => {
	await page.goto('/menu');
	await page.locator('jl-you').getByRole('link', { name: /device\.local/ }).click();
	await expect(page).toHaveURL(/\/device\.local$/);
	await expect(page.locator('h1')).toHaveText('device.local');
	await page.getByRole('button', { name: 'More' }).click();
	await page.getByRole('button', { name: 'Rename' }).click();
	await page.locator('jl-collection-name input').fill('My laptop');
	await page.locator('jl-collection-name').getByRole('button', { name: 'Rename' }).click();
	await expect(page).toHaveURL(/\/my-laptop\.local$/);
	await page.goto('/device.local');
	await expect(page.locator('h1')).toHaveText('Page not found');
});

test('accounts: this device, and adding one', async ({ page }) => {
	await page.goto('/menu/accounts');
	await expect(page.locator('jl-accounts jl-row:first-of-type')).toContainText('This device');
	await expect(page.getByRole('link', { name: 'Add an account' })).toHaveAttribute('href', /\/signin\?add/);
});

test("an organization's tools are under its page, its account's: anyone else is asked to sign in as it", async ({ page }) => {
	for (const path of ['/example.org/post', '/example.org/edit', '/example.org/jobs/3abc']) {
		await page.goto(path);
		await expect(page.getByText('sign in as @example.org')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Sign in' }).last()).toHaveAttribute('href', /\/signin\?next=%2Fexample\.org%2F/);
	}
	await page.goto('/signin');
	await expect(page.locator('jl-signin ol li')).toHaveCount(3);
});

test('old addresses lead to the new ones, with what follows the "#"', async ({ page }) => {
	for (const [from, to] of [
		['/apps', /\/menu\/apps$/],
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
	// The account's row itself switches to it, as this device's does.
	await page.locator('jl-accounts jl-row').nth(1).getByRole('button', { name: /@joblist\.today/ }).click();
	await page.waitForTimeout(1500);
	expect(await page.evaluate(() => /** @type {any} */ (window).stayed)).toBe(true);
});
