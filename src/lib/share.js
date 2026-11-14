/**
 * Share a page: the device's own sharing when there is one, else its address copied.
 * Resolves to 'copied' when it was copied, '' otherwise.
 * @param {{title: string, url: string}} what
 */
export async function share({ title, url }) {
	if (navigator.share) {
		await navigator.share({ title, url }).catch(() => {});
		return '';
	}
	await navigator.clipboard.writeText(url);
	return 'copied';
}
