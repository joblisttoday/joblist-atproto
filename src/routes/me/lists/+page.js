import { redirect } from '@sveltejs/kit';

// Your lists of jobs are the Saved tab.
export function load() {
	redirect(308, '/saved');
}
