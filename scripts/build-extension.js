/**
 * The browser add-on (extension/): its scripts bundled (each alone, as a browser loads them),
 * its texts (extension.* of each language), its manifest, popup and icon, all in extension/dist:
 * the add-on itself, to load in Firefox (about:debugging) or to pack (npx web-ext build -s extension/dist).
 * Run: node scripts/build-extension.js [--zip <file>]
 * --zip: also packed as one file, to load as a temporary add-on (the site's /apps offers it).
 */
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';
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
for (const name of ['popup', 'sync', 'background']) {
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

/**
 * Files as a zip (each deflated), with nothing but Node: what a browser loads as an add-on.
 * @param {{name: string, data: Buffer}[]} files
 */
export function zip(files) {
	/** @type {Buffer[]} */
	const parts = [];
	/** @type {Buffer[]} */
	const central = [];
	let offset = 0;
	// 1980-01-01, the format's first day: the same file for the same add-on.
	const time = 0;
	const date = (1 << 5) | 1;
	for (const { name, data } of files) {
		const packed = deflateRawSync(data);
		const path = Buffer.from(name);
		const sum = crc32(data);
		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(0, 6);
		local.writeUInt16LE(8, 8);
		local.writeUInt16LE(time, 10);
		local.writeUInt16LE(date, 12);
		local.writeUInt32LE(sum, 14);
		local.writeUInt32LE(packed.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(path.length, 26);
		local.writeUInt16LE(0, 28);
		const entry = Buffer.alloc(46);
		entry.writeUInt32LE(0x02014b50, 0);
		entry.writeUInt16LE(20, 4);
		entry.writeUInt16LE(20, 6);
		entry.writeUInt16LE(0, 8);
		entry.writeUInt16LE(8, 10);
		entry.writeUInt16LE(time, 12);
		entry.writeUInt16LE(date, 14);
		entry.writeUInt32LE(sum, 16);
		entry.writeUInt32LE(packed.length, 20);
		entry.writeUInt32LE(data.length, 24);
		entry.writeUInt16LE(path.length, 28);
		entry.writeUInt32LE(offset, 42);
		parts.push(local, path, packed);
		central.push(entry, path);
		offset += local.length + path.length + packed.length;
	}
	const size = central.reduce((n, b) => n + b.length, 0);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(files.length, 8);
	end.writeUInt16LE(files.length, 10);
	end.writeUInt32LE(size, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...parts, ...central, end]);
}

const at = process.argv.indexOf('--zip');
if (at > 0 && process.argv[at + 1]) {
	const file = process.argv[at + 1];
	const names = (await readdir(out)).sort();
	await mkdir(dirname(file), { recursive: true });
	await writeFile(file, zip(await Promise.all(names.map(async (name) => ({ name, data: await readFile(`${out}/${name}`) })))));
	console.log(`the add-on, packed: ${file}`);
}
console.log('extension/dist is the add-on: load extension/dist/manifest.json in about:debugging');
