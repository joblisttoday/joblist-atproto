import { redirect } from '@sveltejs/kit';

// Your saved organizations are on the home, under the search.
export function load() {
	redirect(308, '/');
}
