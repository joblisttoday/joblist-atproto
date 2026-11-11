import { expect, test } from '@playwright/test';
import config from '../src/lib/data/config.json' with { type: 'json' };

/**
 * A visitor's browser asks only a few job boards itself (config.limits.liveBoards), even when
 * the snapshot is too old to show: never every board, from every visitor. Here the snapshot
 * is a month old, and the boards are not really asked (their requests are counted, then stopped).
 */
const ours = (/** @type {URL} */ url) => url.hostname === '127.0.0.1' || url.href.startsWith(config.snapshot.path) || /openfreemap|umami|bsky/.test(url.hostname);

for (const path of ['/jobs', '/companies', '/gitlab.com']) {
	test(`${path} asks few job boards, the snapshot too old`, async ({ page }) => {
		await page.clock.setFixedTime(Date.now() + 30 * 24 * 3600 * 1000);
		let asked = 0;
		await page.route(
			(url) => !ours(url),
			(route) => {
				asked++;
				return route.abort();
			}
		);
		await page.goto(path);
		await page.waitForTimeout(8000);
		expect(asked).toBeLessThanOrEqual(config.limits.liveBoards);
	});
}
