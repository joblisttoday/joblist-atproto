import { qualityTests } from './quality.js';

/**
 * The quality gate (quality.js) on each page. touch: 44, an app used with fingers (the gate
 * applies it to the phone; the desktop keeps WCAG's 24px).
 */
const touch = 44;

qualityTests([
	{ name: 'home', path: '/', touch },
	{ name: 'organization', path: '/bsky.app', touch },
	{ name: 'no organization', path: '/example-not-on-joblist.org', touch },
	{ name: 'sign in', path: '/signin', touch },
	{ name: 'post a job, signed out', path: '/joblist.today/post', touch },
	{ name: 'embed', path: '/joblist.today/embed', touch },
	{ name: 'settings', path: '/settings', touch },
	{ name: 'not found', path: '/a/b/c', touch }
]);
