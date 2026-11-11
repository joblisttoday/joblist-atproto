/**
 * The built site served as GitHub Pages serves it, for the end-to-end tests: a file, else
 * its folder's index.html, else 404.html with status 404, on which the app still starts (an
 * organization's /{domain}, a job's /job/…). vite preview serves the app's own build only,
 * not the files site/site.js writes after it.
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

createServer(async (req, res) => {
	const { pathname } = new URL(req.url || '/', 'http://localhost');
	const found = await read(pathname);
	const page = found || { file: join(root, '404.html'), body: await readFile(join(root, '404.html')) };
	res.writeHead(found ? 200 : 404, { 'content-type': types[extname(page.file)] || 'application/octet-stream' });
	res.end(page.body);
}).listen(Number(port), '127.0.0.1', () => console.log(`serving ${dir} on http://127.0.0.1:${port}`));
