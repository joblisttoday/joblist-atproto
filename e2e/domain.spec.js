import { expect, test } from '@playwright/test';

/**
 * joblist.today/{domain}: an organization's page, from its own atproto account (joblist.today
 * publishes its record); any other domain, what a browser finds of it.
 */
test('an organization is at its domain, from its own account, and its old address leads there', async ({ page }) => {
	await page.goto('/joblist.today');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('joblist', { timeout: 20_000 });
	await expect(page.locator('link[rel=canonical]').last()).toHaveAttribute('href', 'https://joblist.today/joblist.today');
	await page.goto('/company/joblist.today');
	await expect(page).toHaveURL(/\/joblist\.today$/);
});

test("the site's own pages and files stay as they are", async ({ request }) => {
	for (const [path, type] of [['/jobs', 'text/html'], ['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml'], ['/menu', 'text/html']]) {
		const res = await request.get(path);
		expect(res.status(), path).toBe(200);
		expect(res.headers()['content-type'], path).toContain(type);
	}
	expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
	expect((await request.get('/a/b/c/d')).status()).toBe(404);
});

test('a domain joblist does not know has its local profile', async ({ page }) => {
	await page.goto('/example-not-on-joblist.org');
	await expect(page.getByRole('link', { name: 'Your organization? Describe it' })).toBeVisible({ timeout: 20_000 });
});

test("an organization's page has tabs, each its own address", async ({ page }) => {
	await page.goto('/joblist.today');
	const tabs = page.locator('jl-tabs nav');
	await tabs.getByRole('link', { name: /Locations/ }).click({ timeout: 20_000 });
	await expect(page).toHaveURL(/\/joblist\.today\/places$/);
	await expect(page.locator('link[rel=canonical]').last()).toHaveAttribute('href', 'https://joblist.today/joblist.today/places');
	// No history: an old link opens the page.
	await page.goto('/joblist.today/history');
	await expect(page).toHaveURL(/\/joblist\.today$/);
	// Its jobs are its page itself.
	await page.goto('/joblist.today/jobs');
	await expect(page).toHaveURL(/\/joblist\.today$/);
});

test('a name that is no domain is no organization: not found', async ({ page }) => {
	for (const path of ['/test.env', '/fake-fomaine.no-tld']) {
		await page.goto(path);
		await expect(page.locator('h1')).toContainText('Page not found');
		await expect(page.getByRole('link', { name: 'Your organization? Describe it' })).toHaveCount(0);
	}
});
