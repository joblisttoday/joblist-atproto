import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

/**
 * In development, the files the build writes next to the site (site/site.js): llms.txt,
 * robots.txt and the sitemap, made by the same functions, so /llms.txt answers here too.
 * @returns {import('vite').Plugin}
 */
function siteFiles() {
	return {
		name: 'joblist-site-files',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				const path = (req.url || '').split('?')[0];
				if (!['/llms.txt', '/robots.txt', '/sitemap.xml'].includes(path)) return next();
				const load = (/** @type {string} */ file) => server.ssrLoadModule(file);
				const { default: config } = await load('/src/lib/data/config.json');
				let body = '';
				if (path === '/llms.txt') body = (await load('/site/llms.js')).llmsTxt();
				else if (path === '/robots.txt') body = (await load('/site/sitemap.js')).robots(config.url);
				else {
					const pages = (await load('/site/site-pages.js')).sitePages();
					body = (await load('/site/sitemap.js')).sitemap(
						config.url,
						pages.filter((/** @type {any} */ p) => p.listed).map((/** @type {any} */ p) => p.path)
					);
				}
				res.setHeader('Content-Type', path.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8');
				res.end(body);
			});
		}
	};
}

export default defineConfig({
	plugins: [
		siteFiles(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: 'index.html' }),
			// Only this site's scripts run (its inline start script by hash; the analytics are a copy
			// served from here, static/vendor/umami.js). No other site's script: Cloudflare's Web
			// Analytics beacon is refused too (turn it off in the dashboard, see README).
			// Requests go to any https address: job boards, each person's own atproto server, Umami's collector.
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:', 'blob:', 'https:'],
					'font-src': ['self', 'data:'],
					'connect-src': ['self', 'https:'],
					'worker-src': ['self', 'blob:'],
					'object-src': ['none'],
					'base-uri': ['self']
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.js',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
