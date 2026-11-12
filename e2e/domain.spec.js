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

test('a domain that publishes no page has what the browser finds of it', async ({ page }) => {
	await page.goto('/example-not-on-joblist.org');
	// No job board known: looking for one by its name is on its action line, with Follow and "…".
	await expect(page.locator('jl-company-actions').getByRole('button', { name: 'Look for its job board' })).toBeVisible({ timeout: 20_000 });
	await expect(page.getByText('Is this your organization?')).toHaveCount(0);
	// Only once asked does it say what it found.
	await expect(page.getByText('None found under its name')).toHaveCount(0);
});

test("an organization's page is one page: old tab addresses open it", async ({ page }) => {
	for (const path of ['/joblist.today/places', '/joblist.today/history', '/joblist.today/jobs']) {
		await page.goto(path);
		await expect(page).toHaveURL(/\/joblist\.today$/);
	}
	await expect(page.locator('jl-tabs')).toHaveCount(0);
});

test('a name that is no domain is no organization: not found', async ({ page }) => {
	for (const path of ['/test.env', '/fake-fomaine.no-tld']) {
		await page.goto(path);
		await expect(page.locator('h1')).toContainText('Page not found');
		await expect(page.locator('jl-company-header')).toHaveCount(0);
	}
});
