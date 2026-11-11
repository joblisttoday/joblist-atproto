import { redirect } from '@sveltejs/kit';

// An account's page shows what it posted, not the organizations it described: /{handle}.
/** @type {import('./$types').PageLoad} */
export function load({ params, url }) {
	redirect(308, `/${params.handle}${url.hash}`);
}
