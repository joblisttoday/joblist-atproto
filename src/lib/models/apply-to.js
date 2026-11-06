import { toApplyUrl } from './job-post.js';

/**
 * What an application link or email was understood as, to say it back while typing.
 * @param {string} text
 * @returns {{kind: 'email' | 'link', to: string} | {kind: 'unclear'} | null} null when empty
 */
export function readApplyTo(text) {
	if (!text.trim()) return null;
	const url = toApplyUrl(text);
	if (url.startsWith('mailto:')) return { kind: 'email', to: url.slice('mailto:'.length) };
	try {
		const { hostname, protocol } = new URL(url);
		if ((protocol === 'https:' || protocol === 'http:') && hostname.includes('.')) return { kind: 'link', to: hostname.replace(/^www\./, '') };
	} catch {
		// not a link
	}
	return { kind: 'unclear' };
}
