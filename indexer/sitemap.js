import config from '../src/lib/data/config.json' with { type: 'json' };
import { escape } from './html.js';

/**
 * A sitemap of the site's pages.
 * @param {string} origin e.g. https://joblist.today
 * @param {string[]} paths absolute paths, e.g. /company/acme.org
 */
export function sitemap(origin, paths) {
	const urls = paths.map((path) => `<url><loc>${escape(origin + path)}</loc></url>`).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * robots.txt: crawl everything, and where the sitemaps are: the built pages', and the
 * pages per city and field (made by the Worker from the latest snapshot).
 * @param {string} origin
 */
export function robots(origin) {
	return `User-agent: *\nDisallow:\n\nSitemap: ${origin}/sitemap.xml\nSitemap: ${origin}${config.landing.sitemap}\n`;
}
