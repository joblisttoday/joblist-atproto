import { redirect } from '@sveltejs/kit';

// The tools page became the "From anywhere" part of /add: keep old links working.
export function load() {
	redirect(308, '/add');
}
