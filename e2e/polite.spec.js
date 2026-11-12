import { expect, test } from '@playwright/test';
import config from '../src/lib/data/config.json' with { type: 'json' };

/**
 * A browser asks only some job boards itself (config.kept.boardsPerVisit), however many
 * organizations are saved: never every board at once. Here 60 are saved, and the boards are
 * not really asked (their requests are counted, then stopped).
 */
const ours = (/** @type {URL} */ url) => url.hostname === '127.0.0.1' || /openfreemap|umami|bsky|plc\.directory/.test(url.hostname);

test('Jobs asks some of the saved organizations’ boards, not all', async ({ page }) => {
	await page.addInitScript(() => {
		const saved = Array.from({ length: 60 }, (_, i) => ({ url: `https://org${i}.example.org`, name: `Org ${i}`, at: '2026-11-01T00:00:00Z', board: { provider: 'greenhouse', id: `org${i}` } }));
		localStorage.setItem('joblist.kept.v1', JSON.stringify(saved));
	});
	let asked = 0;
	await page.route(
		(url) => !ours(url),
		(route) => {
			asked++;
			return route.abort();
		}
	);
	await page.goto('/#view=list');
	await page.waitForTimeout(6000);
	expect(asked).toBeGreaterThan(0);
	expect(asked).toBeLessThanOrEqual(config.kept.boardsPerVisit);
});
