import { redirect } from '@sveltejs/kit';

// The organizations you follow are on Explore, the home.
export function load() {
	redirect(308, '/');
}
