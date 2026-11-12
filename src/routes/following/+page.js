import { redirect } from '@sveltejs/kit';

// The organizations you follow are Explore's Organizations.
export function load() {
	redirect(308, '/companies');
}
