import { qualityTests } from './quality.js';

/**
 * The quality gate (quality.js) on each kind of page and two dialogs. touch: 44, an app used with fingers
 * (the gate applies it to the phone; the desktop keeps WCAG's 24px).
 */
const touch = 44;

qualityTests([
	{ name: 'home', path: '/', touch },
	{ name: 'jobs', path: '/jobs', touch },
	{ name: 'organizations', path: '/companies', touch },
	{ name: 'lists', path: '/lists', touch },
	{ name: 'list', path: '/joblist.today/3my7zpwloir2s', touch },
	{ name: 'organization', path: '/company/ableton.com', touch },
	{ name: 'profile', path: '/joblist.today', touch },
	{ name: 'me', path: '/me', touch },
	{ name: 'my lists', path: '/me/lists', touch },
	{ name: 'menu', path: '/menu', touch },
	{ name: 'language', path: '/menu/language', touch },
	{ name: 'trends', path: '/stats', touch },
	{ name: 'add an organization', path: '/add', touch },
	{ name: 'post a job', path: '/jobs/new', touch },
	{ name: 'new list', path: '/lists/new', touch },
	{
		// Nothing read (offline, the snapshot down): the page says why, not that it is empty.
		name: 'data unreachable',
		touch,
		open: async (page) => {
			await page.route((url) => url.hostname !== '127.0.0.1', (route) => route.abort());
			await page.goto('/companies');
			await page.locator('jl-data-state[state="unreachable"]').waitFor();
		}
	},
	{
		name: 'job dialog',
		touch,
		open: async (page) => {
			await page.goto('/jobs#view=list');
			await page.locator('jl-job button').first().click();
			await page.locator('dialog[open]').waitFor();
		}
	},
	{
		name: 'delete a collection',
		touch,
		open: async (page) => {
			await page.goto('/me/lists');
			await page.getByRole('button', { name: 'New list of jobs' }).click();
			await page.locator('jl-collection-name input').fill('Dream jobs');
			await page.locator('jl-collection-name button[type="submit"]').click();
			await page.getByRole('button', { name: 'Delete', exact: true }).click();
			await page.locator('dialog[open]').waitFor();
		}
	}
]);
