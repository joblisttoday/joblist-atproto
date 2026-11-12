import { redirect } from '@sveltejs/kit';

// The organizations you follow are the Following tab.
export function load() {
	redirect(308, '/following');
}
