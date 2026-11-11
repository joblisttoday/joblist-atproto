import config from '../src/lib/data/config.json' with { type: 'json' };
import { escape } from './html.js';

/**
 * A date as sitemaps want it (W3C datetime), or '' when it is not one.
 * @param {unknown} value
 */
function lastmod(value) {
	const ms = typeof value === 'string' ? Date.parse(value) : NaN;
	return Number.isFinite(ms) ? new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z') : '';
}

/**
 * A sitemap of the site's pages.
 * @param {string} origin e.g. https://joblist.today
 * @param {(string | {path: string, updated?: string})[]} pages absolute paths, e.g. /company/acme.org,
 *   with when they last changed (their newest job), when known
 */
export function sitemap(origin, pages) {
	const urls = pages
		.map((entry) => {
			const { path, updated } = typeof entry === 'string' ? { path: entry, updated: '' } : entry;
			const date = lastmod(updated);
			return `<url><loc>${escape(origin + path)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`;
		})
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * robots.txt: crawl everything, and where the sitemap is.
 * @param {string} origin
 */
export function robots(origin) {
	return `User-agent: *\nDisallow:\n\nSitemap: ${origin}/sitemap.xml\n`;
}
