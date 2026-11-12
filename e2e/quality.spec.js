import { qualityTests } from './quality.js';

/**
 * The quality gate (quality.js) on each kind of page and two dialogs. touch: 44, an app used with fingers
 * (the gate applies it to the phone; the desktop keeps WCAG's 24px).
 */
const touch = 44;

qualityTests([
	{ name: 'home', path: '/', touch },
	{ name: 'organizations', path: '/companies', touch },
	{ name: 'a list of jobs', path: '/jobs/saved', touch },
	{ name: 'organization', path: '/joblist.today', touch },
	{ name: 'menu', path: '/menu', touch },
	{ name: 'language', path: '/menu/language', touch },
	{ name: 'this device', path: '/device.local', touch },
	{ name: 'sign in', path: '/signin', touch },
	{ name: 'post a job, signed out', path: '/joblist.today/post', touch },
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
			await page.goto('/jobs/saved');
			await page.getByRole('button', { name: 'New list of jobs' }).click();
			await page.locator('jl-collection-name input').fill('Dream jobs');
			await page.locator('jl-collection-name button[type="submit"]').click();
			await page.getByRole('button', { name: 'Delete', exact: true }).click();
			await page.locator('dialog[open]').waitFor();
		}
	}
]);
