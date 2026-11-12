import { expect, test } from '@playwright/test';

/**
 * Lists of organizations are gone (tags and places say the same): a link to one opens its
 * author's page, and private lists kept in this browser become saved organizations, each
 * tagged with its list's name.
 */
test('a link to a list opens its author', async ({ page }) => {
	await page.goto('/joblist.today/3my7zpwloir2s');
	await expect(page).toHaveURL(/\/joblist\.today$/);
});

test('private lists become saved organizations, tagged', async ({ page }) => {
	await page.addInitScript(() => {
		if (sessionStorage.getItem('seeded')) return;
		sessionStorage.setItem('seeded', '1');
		const list = (/** @type {string} */ rkey, /** @type {string} */ name, /** @type {string[]} */ companies) => ({ uri: '', cid: '', did: 'local', rkey, value: { name, companies, createdAt: '2026-11-01T00:00:00Z' } });
		localStorage.setItem('joblist.lists.v1', JSON.stringify([list('lsaved', 'Saved organizations', ['ableton.com']), list('lcoops', 'Coops', ['ableton.com', 'example.coop'])]));
	});
	await page.goto('/following');
	await expect(page.locator('main')).toContainText('example.coop');
	const kept = await page.evaluate(() => [JSON.parse(localStorage.getItem('joblist.kept.v1') || '[]'), localStorage.getItem('joblist.lists.v1')]);
	expect(kept[0].map((/** @type {any} */ k) => [k.url, k.tags])).toEqual([
		['https://ableton.com', ['coops']],
		['https://example.coop', ['coops']]
	]);
	expect(kept[1]).toBeNull();
});
