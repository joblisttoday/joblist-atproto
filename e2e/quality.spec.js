import { qualityTests } from './quality.js';

/**
 * The quality gate (quality.js, a copy from savoir-faire: improve it there, then copy it
 * again) on each kind of page and two dialogs. touch: 44, an app used with fingers
 * (the gate applies it to the phone; the desktop keeps WCAG's 24px).
 */
const touch = 44;

qualityTests([
	{ name: 'jobs', path: '/', touch },
	{ name: 'organizations', path: '/companies', touch },
	{ name: 'lists', path: '/lists', touch },
	{ name: 'list', path: '/joblist.today/3my7zpwloir2s', touch },
	{ name: 'organization', path: '/company/ableton.com', touch },
	{ name: 'profile', path: '/joblist.today', touch },
	{ name: 'saved', path: '/saved', touch },
	{ name: 'menu', path: '/menu', touch },
	{ name: 'language', path: '/menu/language', touch },
	{ name: 'trends', path: '/stats', touch },
	{ name: 'add an organization', path: '/add', touch },
	{ name: 'post a job', path: '/jobs/new', touch },
	{ name: 'new list', path: '/lists/new', touch },
	{
		name: 'job dialog',
		touch,
		open: async (page) => {
			await page.goto('/#view=list');
			await page.locator('jl-job button').first().click();
			await page.locator('dialog[open]').waitFor();
		}
	},
	{
		name: 'delete a collection',
		touch,
		open: async (page) => {
			await page.goto('/saved');
			await page.locator('section[aria-labelledby="saved-new"] input').fill('Dream jobs');
			await page.locator('section[aria-labelledby="saved-new"] button[type="submit"]').click();
			await page.getByRole('button', { name: 'Delete', exact: true }).click();
			await page.locator('dialog[open]').waitFor();
		}
	}
]);
