import { expect, test } from '@playwright/test';
import { VIEWPORTS, qualityProblems } from './quality.js';

/**
 * The quality gate (quality.js, a copy from savoir-faire) on each kind of page and dialog.
 * Run here rather than with its qualityTests(): joblist sizes its controls by pointer
 * (44px for fingers, 36px with a mouse: app.css), so the phone is checked as a touch
 * screen against 44px and the desktop with a mouse against WCAG's 24px. The app draws
 * its pages in the browser: each screen is checked once its h1 is there.
 *
 * Skipped everywhere: classless, because the icon library (@lucide/svelte) puts its own
 * classes on its <svg>; joblist's own markup has none.
 */
const skip = ['classless'];

/** @param {string} path */
const visit = (path) => async (/** @type {import('@playwright/test').Page} */ page) => {
	await page.goto(path);
	await page.locator('h1').first().waitFor({ state: 'attached' });
};

const screens = [
	{ name: 'jobs', open: visit('/') },
	{ name: 'organizations', open: visit('/companies') },
	{ name: 'lists', open: visit('/lists') },
	{ name: 'list', open: visit('/joblist.today/3my7zpwloir2s') },
	{ name: 'organization', open: visit('/company/ableton.com') },
	{ name: 'profile', open: visit('/joblist.today') },
	{ name: 'saved', open: visit('/saved') },
	{ name: 'settings', open: visit('/settings') },
	{ name: 'trends', open: visit('/stats') },
	{ name: 'add an organization', open: visit('/add') },
	{ name: 'post a job', open: visit('/jobs/new') },
	{
		name: 'job dialog',
		open: async (/** @type {import('@playwright/test').Page} */ page) => {
			await page.goto('/#view=list');
			await page.locator('jl-job button').first().click();
			await page.locator('dialog[open]').waitFor();
		}
	},
	{
		name: 'delete a collection',
		open: async (/** @type {import('@playwright/test').Page} */ page) => {
			await visit('/saved')(page);
			await page.locator('section[aria-labelledby="saved-new"] input').fill('Dream jobs');
			await page.locator('section[aria-labelledby="saved-new"] button[type="submit"]').click();
			await page.getByRole('button', { name: 'Delete', exact: true }).click();
			await page.locator('dialog[open]').waitFor();
		}
	}
];

for (const [device, use, touch] of /** @type {const} */ ([
	['phone', { viewport: VIEWPORTS.phone, hasTouch: true, isMobile: true }, 44],
	['desktop', { viewport: VIEWPORTS.desktop }, 24]
])) {
	test.describe(`UI quality gate (${device})`, () => {
		test.use(use);
		for (const screen of screens)
			test(screen.name, async ({ page }) => {
				await screen.open(page);
				expect(await qualityProblems(page, { touch, skip })).toEqual([]);
			});
	});
}
