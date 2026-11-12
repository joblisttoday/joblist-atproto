import { redirect } from '@sveltejs/kit';

// What is yours is in the Menu (searches, lists) and on the home (organizations).
export function load() {
	redirect(308, '/menu');
}
