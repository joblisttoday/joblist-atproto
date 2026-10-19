/** @param {unknown} value */
export function escape(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * The app's HTML shell with page-specific head tags and a no-JavaScript body.
 * @param {string} template build/index.html
 * @param {{title: string, description: string, url: string, body: string}} meta
 */
export function page(template, { title, description, url, body }) {
	const text = description.slice(0, 300);
	const head = [
		`<title>${escape(title)}</title>`,
		`<meta name="description" content="${escape(text)}">`,
		`<link rel="canonical" href="${escape(url)}">`,
		`<meta property="og:type" content="website">`,
		`<meta property="og:site_name" content="joblist">`,
		`<meta property="og:title" content="${escape(title)}">`,
		`<meta property="og:description" content="${escape(text)}">`,
		`<meta property="og:url" content="${escape(url)}">`,
		`<meta name="twitter:card" content="summary">`
	].join('\n\t\t');
	return template
		.replace(/<title>[\s\S]*?<\/title>\s*/, '')
		.replace('</head>', `\t${head}\n\t</head>`)
		.replace(/(<body[^>]*>)/, body ? `$1\n\t\t<noscript>${body}</noscript>` : '$1');
}
