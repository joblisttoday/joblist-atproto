/**
 * The embed (embed/src/joblist-jobs.js) as one file anyone can load: joblist's job board
 * readers and its texts built in, nothing fetched from joblist.today. Written to
 * embed/dist/joblist-jobs.js, kept in the repository so that jsDelivr serves it from GitHub
 * by version (cdn.jsdelivr.net/gh/joblisttoday/joblist-atproto@<tag>/embed/dist/joblist-jobs.js);
 * the site serves a copy at /embed/joblist-jobs.js (indexer/site.js).
 * Run: node scripts/build-embed.js [out-dir]
 */
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { embedSettings } from '../indexer/embed-settings.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = process.argv[2] || `${root}embed/dist`;
await build({
	configFile: false,
	logLevel: 'warn',
	resolve: { alias: { '#lib': `${root}src/lib` } },
	define: { __EMBED__: JSON.stringify(embedSettings()) },
	build: {
		outDir: out,
		emptyOutDir: true,
		minify: true,
		lib: { entry: `${root}embed/src/joblist-jobs.js`, formats: ['es'], fileName: () => 'joblist-jobs.js' }
	}
});
console.log(`${out}/joblist-jobs.js`);
