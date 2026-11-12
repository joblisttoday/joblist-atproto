import { redirect } from '@sveltejs/kit';

// Your searches are chips on Jobs.
export function load() {
	redirect(308, '/jobs');
}
