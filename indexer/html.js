import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };

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
 * A text as a search result shows it: without hashtags ("#hiring #rust"), on one line.
 * @param {string} text
 */
export function plain(text) {
	return text
		.replace(/(^|\s)#[\p{N}_]*\p{L}[\p{L}\p{N}_]*/gu, '$1')
		.replace(/\s+/g, ' ')
		.replace(/\s+([,.;:!?])/g, '$1')
		.replace(/^[\s·,.;:]+|[\s·,;:]+$/g, '')
		.trim();
}

/**
 * The picture of a link preview: the page's own (a company's logo, square), else the site's (wide).
 * @param {string} [image]
 */
function preview(image) {
	if (image) return [`<meta property="og:image" content="${escape(image)}">`, `<meta name="twitter:card" content="summary">`];
	const { path, width, height } = config.shareImage;
	return [
		`<meta property="og:image" content="${escape(config.url + path)}">`,
		`<meta property="og:image:width" content="${width}">`,
		`<meta property="og:image:height" content="${height}">`,
		`<meta property="og:image:alt" content="${escape(en['share.image'])}">`,
		`<meta name="twitter:card" content="summary_large_image">`
	];
}

/**
 * The app's HTML shell with page-specific head tags and a no-JavaScript body.
 * @param {string} template build/index.html
 * @param {{title: string, description: string, url?: string, body: string, type?: string, head?: string, noindex?: boolean, image?: string, preload?: string[]}} meta
 *   type: the og:type (default website); head: more tags, like jsonLd(); noindex: a page for people, not search results;
 *   image: the page's picture for link previews (default: the site's);
 *   preload: the snapshot files the page starts from (config snapshot.preload), fetched while the app loads
 */
export function page(template, { title, description, url, body, type = 'website', head: extra = '', noindex = false, image, preload = config.snapshot.preload.page }) {
	const text = plain(description).slice(0, 300);
	const head = [
		`<title>${escape(title)}</title>`,
		noindex ? `<meta name="robots" content="noindex">` : '',
		`<meta name="description" content="${escape(text)}">`,
		// No address: a page shared by many (an organization's, a job's), whose own the app knows.
		url ? `<link rel="canonical" href="${escape(url)}">` : '',
		`<meta property="og:type" content="${escape(type)}">`,
		`<meta property="og:site_name" content="${escape(config.name)}">`,
		`<meta property="og:title" content="${escape(title)}">`,
		`<meta property="og:description" content="${escape(text)}">`,
		url ? `<meta property="og:url" content="${escape(url)}">` : '',
		...preview(image),
		// The data the page starts from: fetched while the app itself loads, not after.
		// Only what it shows: all the jobs are large, and a phone reads them for seconds.
		...preload.map(
			(/** @type {string} */ name) => `<link rel="preload" as="fetch" crossorigin="anonymous" href="${escape(`${config.snapshot.path}/${name}`)}">`
		),
		extra
	]
		.filter(Boolean)
		.join('\n\t\t');
	// Marked blocks are replaced, not added again, so prerendering twice is harmless.
	return template
		.replace(/\s*<!-- jl:head -->[\s\S]*?<!-- \/jl:head -->/, '')
		.replace(/\s*<!-- jl:body -->[\s\S]*?<!-- \/jl:body -->/, '')
		.replace(/<title>[\s\S]*?<\/title>\s*/, '')
		// Functions, not strings: "$'" or "$&" in someone's text must stay text.
		.replace('</head>', () => `\t<!-- jl:head -->\n\t\t${head}\n\t\t<!-- /jl:head -->\n\t</head>`)
		.replace(/(<body[^>]*>)/, (tag) => (body ? `${tag}\n\t\t<!-- jl:body --><noscript>${body}</noscript><!-- /jl:body -->` : tag));
}
