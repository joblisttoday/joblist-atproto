import { redirect } from '@sveltejs/kit';

// Lists of organizations are gone (tags and places say the same): a link to one opens its
// author's page; one kept in this browser, its organizations, now saved ones with its name as a tag.
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	redirect(308, params.handle === 'local' ? '/' : `/${params.handle}`);
}
