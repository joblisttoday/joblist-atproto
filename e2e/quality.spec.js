import { qualityTests } from './quality.js';

/**
 * The quality gate (quality.js) on each kind of page and two dialogs. touch: 44, an app used with fingers
 * (the gate applies it to the phone; the desktop keeps WCAG's 24px).
 */
const touch = 44;

qualityTests([
	{ name: 'home', path: '/', touch },
	{ name: 'saved', path: '/saved', touch },
	{ name: 'organization', path: '/joblist.today', touch },
	{ name: 'menu', path: '/menu', touch },
	{ name: 'language', path: '/menu/language', touch },
	{ name: 'for organizations', path: '/org', touch },
	{ name: 'add an organization', path: '/org/page', touch },
	{ name: 'post a job', path: '/org/post', touch },
	{
		name: 'job dialog',
		touch,
		open: async (page) => {
			await page.addInitScript(() => localStorage.setItem('joblist.kept.v1', JSON.stringify([{ url: 'https://gitlab.com', name: 'GitLab', at: '2026-11-01T00:00:00Z', board: { provider: 'greenhouse', id: 'gitlab' } }])));
			await page.goto('/jobs#view=list');
			await page.locator('jl-job button').first().click({ timeout: 20_000 });
			await page.locator('dialog[open]').waitFor();
		}
	},
	{
		name: 'delete a collection',
		touch,
		open: async (page) => {
			await page.goto('/saved');
			await page.getByRole('button', { name: 'New list of jobs' }).click();
			await page.locator('jl-collection-name input').fill('Dream jobs');
			await page.locator('jl-collection-name button[type="submit"]').click();
			await page.getByRole('button', { name: 'Delete', exact: true }).click();
			await page.locator('dialog[open]').waitFor();
		}
	}
]);
