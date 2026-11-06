/**
 * Links from records and job boards are written by anyone: only web links (and email
 * for applying) are kept, so a link can never run script on this site (javascript:, data:…).
 * @param {unknown} value
 * @param {{email?: boolean}} [options] email: also keep mailto: links
 * @returns {string} the link, or '' when it is not one we follow
 */
export function safeUrl(value, { email = false } = {}) {
	const text = String(value ?? '').trim();
	try {
		const { protocol } = new URL(text);
		return protocol === 'https:' || protocol === 'http:' || (email && protocol === 'mailto:') ? text : '';
	} catch {
		return '';
	}
}
