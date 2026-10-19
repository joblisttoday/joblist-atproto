/** @param {unknown} value */
export function escape(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Structured data for search engines, safe inside a script tag.
 * @param {Record<string, any>} data
 */
export function jsonLd(data) {
	return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

/**
 * The app's HTML shell with page-specific head tags and a no-JavaScript body.
 * @param {string} template build/index.html
 * @param {{title: string, description: string, url: string, body: string, type?: string, head?: string}} meta
 *   type: the og:type (default website); head: more tags, like jsonLd()
 */
export function page(template, { title, description, url, body, type = 'website', head: extra = '' }) {
	const text = description.slice(0, 300);
	const head = [
		`<title>${escape(title)}</title>`,
		`<meta name="description" content="${escape(text)}">`,
		`<link rel="canonical" href="${escape(url)}">`,
		`<meta property="og:type" content="${escape(type)}">`,
		`<meta property="og:site_name" content="joblist">`,
		`<meta property="og:title" content="${escape(title)}">`,
		`<meta property="og:description" content="${escape(text)}">`,
		`<meta property="og:url" content="${escape(url)}">`,
		`<meta name="twitter:card" content="summary">`,
		extra
	]
		.filter(Boolean)
		.join('\n\t\t');
	// Marked blocks are replaced, not added again, so prerendering twice is harmless.
	return template
		.replace(/\s*<!-- jl:head -->[\s\S]*?<!-- \/jl:head -->/, '')
		.replace(/\s*<!-- jl:body -->[\s\S]*?<!-- \/jl:body -->/, '')
		.replace(/<title>[\s\S]*?<\/title>\s*/, '')
		.replace('</head>', `\t<!-- jl:head -->\n\t\t${head}\n\t\t<!-- /jl:head -->\n\t</head>`)
		.replace(/(<body[^>]*>)/, body ? `$1\n\t\t<!-- jl:body --><noscript>${body}</noscript><!-- /jl:body -->` : '$1');
}
