import { expect, test } from '@playwright/test';

/**
 * joblist.today/{domain}: an organization's page; old /company/{domain} links lead there; the
 * site's own pages and files are not hidden by it; an address that is nothing is still a 404.
 */
test('an organization is at its domain, and its old address leads there', async ({ page, request }) => {
	await page.goto('/ableton.com');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Ableton');
	await expect(page.locator('link[rel=canonical]').last()).toHaveAttribute('href', 'https://joblist.today/ableton.com');
	const old = await request.get('/company/ableton.com', { maxRedirects: 0 });
	expect(old.status()).toBe(301);
	expect(old.headers().location).toBe('/ableton.com');
});

test("the site's own pages and files stay as they are", async ({ request }) => {
	for (const [path, type] of [['/jobs', 'text/html'], ['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml'], ['/me/organizations', 'text/html']]) {
		const res = await request.get(path);
		expect(res.status(), path).toBe(200);
		expect(res.headers()['content-type'], path).toContain(type);
	}
	expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
	expect((await request.get('/a/b/c/d')).status()).toBe(404);
});

test('a domain joblist does not know has its local profile', async ({ page }) => {
	await page.goto('/example-not-on-joblist.org');
	await expect(page.getByRole('link', { name: 'Suggest to joblist' })).toBeVisible();
});

test("an organization's page has tabs, each its own address", async ({ page }) => {
	await page.goto('/ableton.com');
	const tabs = page.locator('jl-tabs nav');
	await tabs.getByRole('link', { name: /Locations/ }).click();
	await expect(page).toHaveURL(/\/ableton\.com\/places$/);
	await expect(page.locator('main')).toContainText('Schönhauser Allee');
	await expect(page.locator('link[rel=canonical]').last()).toHaveAttribute('href', 'https://joblist.today/ableton.com/places');
	// No history: an old link opens the page.
	await page.goto('/ableton.com/history');
	await expect(page).toHaveURL(/\/ableton\.com$/);
	// Its jobs are its page itself.
	await page.goto('/ableton.com/jobs');
	await expect(page).toHaveURL(/\/ableton\.com$/);
});

test('a name that is no domain is no organization: not found', async ({ page }) => {
	for (const path of ['/test.env', '/fake-fomaine.no-tld']) {
		await page.goto(path);
		await expect(page.locator('h1')).toContainText('Page not found');
		await expect(page.getByRole('link', { name: 'Suggest to joblist' })).toHaveCount(0);
	}
});
