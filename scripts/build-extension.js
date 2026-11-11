/**
 * The browser add-on (extension/): its scripts bundled (each alone, as a browser loads them),
 * its texts (extension.* of each language), its manifest, popup and icon, all in extension/dist:
 * the add-on itself, to load in Firefox (about:debugging) or to pack (npx web-ext build -s extension/dist).
 * Run: node scripts/build-extension.js
 */
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = `${root}extension/dist`;

/** The add-on's texts, in each language. */
async function messages() {
	/** @type {Record<string, Record<string, string>>} */
	const all = {};
	for (const locale of ['en', 'fr', 'de', 'es']) {
		const texts = JSON.parse(await readFile(`${root}src/lib/i18n/locales/${locale}.json`, 'utf8'));
		all[locale] = Object.fromEntries(Object.entries(texts).filter(([key]) => key.startsWith('extension.')));
	}
	return all;
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const define = { __MESSAGES__: JSON.stringify(await messages()) };
for (const name of ['popup', 'sync']) {
	await build({
		configFile: false,
		logLevel: 'warn',
		resolve: { alias: { '#lib': `${root}src/lib` } },
		define,
		build: {
			outDir: out,
			emptyOutDir: false,
			minify: true,
			lib: { entry: `${root}extension/src/${name}.js`, name: `joblist_${name}`, formats: ['iife'], fileName: () => `${name}.js` }
		}
	});
}
for (const file of ['manifest.json', 'popup.html', 'popup.css']) await copyFile(`${root}extension/${file}`, `${out}/${file}`);
await copyFile(`${root}static/icon.svg`, `${out}/icon.svg`);
console.log('extension/dist is the add-on: load extension/dist/manifest.json in about:debugging');
