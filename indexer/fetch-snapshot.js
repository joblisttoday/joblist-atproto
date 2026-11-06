/**
 * Download the published snapshot instead of building it, for the site's build:
 * the snapshot workflow already rebuilds it every 6 hours, and indexing again on
 * each deploy would ask the job boards and OpenStreetMap twice.
 *
 *   node indexer/fetch-snapshot.js [snapshot-dir]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };

const [out = 'static/snapshot'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
for (const name of config.snapshot.prerenderFiles) {
	const res = await fetch(`${config.snapshot.path}/${name}`);
	if (!res.ok) throw new Error(`${name}: ${res.status}`);
	writeFileSync(join(out, name), await res.text());
	console.log(`fetched ${name}`);
}
