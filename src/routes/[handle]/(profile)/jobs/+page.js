import { redirect } from '@sveltejs/kit';

// An account's page is its jobs (/{handle}); an organization's jobs are its page too.
/** @type {import('./$types').PageLoad} */
export function load({ params, url }) {
	redirect(308, `/${params.handle}${url.hash}`);
}
