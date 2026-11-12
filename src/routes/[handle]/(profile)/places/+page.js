import { redirect } from '@sveltejs/kit';

// An organization's places are one line on its page now: an old link opens the page.
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	redirect(308, `/${params.handle}`);
}
