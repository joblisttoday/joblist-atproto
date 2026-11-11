import { redirect } from '@sveltejs/kit';

// An organization's page is joblist.today/{domain} now: links to /company/{domain} keep working.
/** @type {import('./$types').PageLoad} */
export function load({ params, url }) {
	redirect(308, `/${params.key}${url.hash}`);
}
