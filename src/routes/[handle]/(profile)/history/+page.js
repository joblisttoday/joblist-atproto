import { redirect } from '@sveltejs/kit';

// An organization's page has no history: only it (or joblist's starter account) writes it.
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	redirect(308, `/${params.handle}`);
}
