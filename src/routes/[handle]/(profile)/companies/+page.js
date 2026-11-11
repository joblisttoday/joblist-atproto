import { redirect } from '@sveltejs/kit';

// An account's organizations are its page's first tab now (/{handle}).
/** @type {import('./$types').PageLoad} */
export function load({ params, url }) {
	redirect(308, `/${params.handle}${url.hash}`);
}
