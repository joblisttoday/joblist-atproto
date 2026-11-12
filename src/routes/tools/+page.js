import { redirect } from '@sveltejs/kit';

// The tools page became /apps (the add-on, and sending a page from anywhere): keep old links working.
export function load() {
	redirect(308, '/menu/apps');
}
