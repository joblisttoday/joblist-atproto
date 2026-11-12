import { redirect } from '@sveltejs/kit';

// Your searches are chips on Jobs, the home.
export function load() {
	redirect(308, '/');
}
