import { expect, test } from '@playwright/test';

/**
 * The jobs explorer's map answers fingers and the mouse: nothing covers it, and it is not
 * inert while shown (inert={false} on a custom element once wrote inert="false": still inert).
 */
for (const [device, use] of /** @type {const} */ ([
	['phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }],
	['desktop', { viewport: { width: 1440, height: 900 } }]
])) {
	test.describe(`explorer map (${device})`, () => {
		test.use(use);
		test('can be moved and zoomed', async ({ page }) => {
			// The home is the explorer once an organization is followed.
			await page.addInitScript(() => localStorage.setItem('joblist.kept.v1', JSON.stringify([{ url: 'https://gitlab.com', name: 'GitLab', at: '2026-11-01T00:00:00Z', board: { provider: 'greenhouse', id: 'gitlab' } }])));
			await page.goto('/#view=map');
			const map = page.locator('jl-explore-map');
			await map.locator('canvas').waitFor();
			expect(await map.evaluate((el) => /** @type {HTMLElement} */ (el).inert)).toBe(false);
			// A point of the map the results do not cover: the map gets it.
			const box = /** @type {{x: number, y: number, width: number, height: number}} */ (await map.boundingBox());
			const at = { x: box.x + box.width * 0.75, y: box.y + box.height * 0.2 };
			expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName.toLowerCase(), at)).toBe('canvas');
		});
	});
}
