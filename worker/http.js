/**
 * The headers of what this Worker answers. Static files get theirs from
 * static/_headers, which does not apply here: the same rules are repeated.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };

/** Every answer (as static/_headers: /*). */
const common = {
	'Strict-Transport-Security': 'max-age=31536000',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()'
};

/** Feeds and sitemaps: data, never run, readable by any site (web feed readers). */
const dataPolicy = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; sandbox";

const types = {
	html: 'text/html; charset=utf-8',
	atom: 'application/atom+xml; charset=utf-8',
	xml: 'application/xml; charset=utf-8'
};

/**
 * The page's own policy, from the app's shell: the scripts it allows (its start
 * script by hash, see vite.config.js), and no framing by other sites.
 * Without one in the shell, nothing runs.
 * @param {string} template
 */
export function pagePolicy(template) {
	const meta = template.match(/<meta http-equiv="content-security-policy" content="([^"]*)"/i)?.[1];
	return `${meta || "default-src 'none'"}; frame-ancestors 'none'`;
}

/**
 * @param {'html' | 'atom' | 'xml'} type
 * @param {{policy?: string, status?: number}} [options] policy: the page's (html only)
 */
export function headers(type, { policy = '', status = 200 } = {}) {
	/** @type {Record<string, string>} */
	const out = { ...common, 'Content-Type': types[type] };
	out['Content-Security-Policy'] = type === 'html' ? policy : dataPolicy;
	if (type !== 'html') out['Access-Control-Allow-Origin'] = '*';
	// Fresh as the snapshot: kept a while here and in browsers and readers, never when it failed.
	out['Cache-Control'] = status === 200 ? `public, max-age=${config.landing.cacheSeconds}` : 'no-store';
	if (status === 503) out['Retry-After'] = String(config.landing.missingCacheSeconds);
	return out;
}
