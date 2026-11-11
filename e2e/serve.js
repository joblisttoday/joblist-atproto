/**
 * The built site served as Cloudflare serves it (wrangler.jsonc: assets), for the
 * end-to-end tests: the rules of _redirects first (redirects, and rewrites: the site's own
 * names as they are, the page shared by every domain or job), else a file, else its
 * folder's index.html, else
 * 404.html with status 404, on which the app still starts. vite preview serves the
 * app's own build only, not the files indexer/site.js writes after it.
 *
 *   node e2e/serve.js [dir] [port]
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const [dir = 'build', port = '4318'] = process.argv.slice(2);
const root = resolve(dir);
const types = /** @type {Record<string, string>} */ ({
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml',
	'.webmanifest': 'application/manifest+json',
	'.woff2': 'font/woff2'
});

/** @param {string} path */
async function read(path) {
	const file = join(root, normalize(decodeURIComponent(path)));
	if (file !== root && !file.startsWith(root + sep)) return null;
	for (const candidate of [file, join(file, 'index.html')]) {
		try {
			return { file: candidate, body: await readFile(candidate) };
		} catch {
			// not this one
		}
	}
	return null;
}

/**
 * The rules of _redirects, as Cloudflare reads them: the first that matches is followed, a
 * rewrite (200) before any file; :name is one part of the path, * the rest (:splat).
 */
const rules = (await readFile(join(root, '_redirects'), 'utf8').catch(() => ''))
	.split('\n')
	.map((line) => line.trim().split(/\s+/))
	.filter(([from, to]) => from && to && !from.startsWith('#'))
	.map(([from, to, status = '302']) => ({
		from: new RegExp(
			`^${from
				.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
				.replace(/:(\w+)/g, '(?<$1>[^/]+)')
				.replace('*', '(?<splat>.*)')}$`
		),
		to,
		status: Number(status)
	}));

createServer(async (req, res) => {
	const { pathname } = new URL(req.url || '/', 'http://localhost');
	const rule = rules.map((r) => ({ ...r, match: r.from.exec(pathname) })).find((r) => r.match);
	const to = rule ? rule.to.replace(/:(\w+)/g, (_, name) => rule.match?.groups?.[name] ?? '') : '';
	if (rule && rule.status !== 200) {
		res.writeHead(rule.status, { location: to });
		res.end();
		return;
	}
	const found = rule ? await read(to) : await read(pathname);
	const page = found || { file: join(root, '404.html'), body: await readFile(join(root, '404.html')) };
	res.writeHead(found ? 200 : 404, { 'content-type': types[extname(page.file)] || 'application/octet-stream' });
	res.end(page.body);
}).listen(Number(port), '127.0.0.1', () => console.log(`serving ${dir} on http://127.0.0.1:${port}`));
