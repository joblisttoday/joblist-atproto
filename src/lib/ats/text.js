/**
 * Job board HTML as plain text, so no outside markup is ever rendered.
 * Paragraphs are separated by a blank line, list items start with "• ".
 * @param {string | undefined | null} html
 */
export function htmlToText(html) {
	return decode(
		String(html || '')
			.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<li[^>]*>/gi, '\n• ')
			.replace(/<\/(p|div|h[1-6]|ul|ol|section|blockquote|tr)>/gi, '\n\n')
			.replace(/<(p|div|h[1-6]|ul|ol|section|blockquote|tr)[^>]*>/gi, '\n\n')
			.replace(/<[^>]+>/g, '')
	)
		.replace(/[ \t ]+/g, ' ')
		.replace(/ *\n */g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/**
 * Greenhouse sends its HTML escaped once more: &lt;p&gt;…
 * @param {string | undefined | null} text
 */
export function unescapeHtml(text) {
	return decode(String(text || ''));
}

/** @type {Record<string, string>} */
const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…', bull: '•', euro: '€' };

/** @param {string} text */
function decode(text) {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
		if (code[0] === '#') {
			const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
			return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : entity;
		}
		return named[code.toLowerCase()] ?? entity;
	});
}
