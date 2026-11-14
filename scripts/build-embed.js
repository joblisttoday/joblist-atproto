/**
 * The embed (embed/src/joblist-jobs.svelte.js) as one file anyone can load: reading an
 * organization's account and its texts built in, nothing fetched from joblist.today. Written to
 * embed/dist/joblist-jobs.js, kept in the repository so that jsDelivr serves it from GitHub
 * by version (cdn.jsdelivr.net/gh/joblisttoday/joblisttoday@<tag>/embed/dist/joblist-jobs.js);
 * the site serves a copy at /embed/joblist-jobs.js (static/embed, not kept in the repository).
 * Run: node scripts/build-embed.js [out-dir]
 */
import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { embedSettings } from '../site/embed-settings.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = process.argv[2] || `${root}embed/dist`;
await build({
	configFile: false,
	logLevel: 'warn',
	// The app's components, their styles put where they are mounted (the element's shadow
	// root), and the embed's own texts in place of the app's (all languages, every key: large).
	plugins: [svelte({ configFile: false, compilerOptions: { css: 'injected' } })],
	resolve: {
		alias: [
			{ find: '#lib/i18n/index.svelte.js', replacement: `${root}embed/src/i18n.svelte.js` },
			{ find: '#lib', replacement: `${root}src/lib` }
		]
	},
	define: { __EMBED__: JSON.stringify(embedSettings()) },
	build: {
		outDir: out,
		emptyOutDir: true,
		minify: true,
		lib: { entry: `${root}embed/src/joblist-jobs.svelte.js`, formats: ['es'], fileName: () => 'joblist-jobs.js' }
	}
});
// And where the site serves it (static/embed, the address embeds have used from the start).
if (!process.argv[2]) await copyFile(`${out}/joblist-jobs.js`, `${root}static/embed/joblist-jobs.js`);
console.log(`${out}/joblist-jobs.js`);
