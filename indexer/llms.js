import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import agents from '../src/lib/data/agents.json' with { type: 'json' };

/**
 * /llms.txt, written at each build: the words from src/lib/data/agents.json, the record
 * types from the lexicons, the docs from docs/, and the snapshot's counts, so it never
 * says less than the project knows.
 *
 * @param {{root?: string, counts?: {jobs?: number, companies?: number}, generatedAt?: string}} [from]
 *   root: the repository (lexicons/, docs/); counts and generatedAt: the snapshot's meta.json.
 */
export function llmsTxt({ root = '.', counts = {}, generatedAt = '' } = {}) {
	const values = /** @type {Record<string, string>} */ ({
		name: config.name,
		url: config.url,
		source: config.source,
		snapshot: config.snapshot.path,
		userAgent: config.userAgent,
		hours: String(config.snapshot.everyHours)
	});
	const fill = (/** @type {string} */ text) => text.replace(/\{(name|url|source|snapshot|userAgent|hours)\}/g, (_, key) => values[key]);
	const link = (/** @type {{title: string, path?: string, about?: string}} */ item) =>
		`- ${item.path ? `[${item.title}](${config.url}${item.path})` : item.title}${item.about ? `: ${fill(item.about)}` : ''}`;
	const now = [
		counts.jobs && `${counts.jobs.toLocaleString('en')} open jobs`,
		counts.companies && `${counts.companies.toLocaleString('en')} organizations`
	].filter(Boolean);
	return [
		`# ${config.name}`,
		'',
		`> ${fill(agents.intro)}`,
		'',
		fill(agents.lead),
		...(now.length ? ['', `Now: ${now.join(', ')}${generatedAt ? ` (snapshot of ${generatedAt.slice(0, 16).replace('T', ' ')} UTC)` : ''}.`] : []),
		'',
		'## Pages',
		'',
		...agents.pages.map(link),
		'',
		'## Feeds (Atom)',
		'',
		...agents.feeds.map(link),
		'',
		`## Snapshot (JSON, rebuilt every ${config.snapshot.everyHours} hours)`,
		'',
		`Base: ${config.snapshot.path}`,
		'',
		...agents.snapshot.map((f) => `- ${f.file.includes('{') ? `\`${f.file}\`` : `[${f.file}](${config.snapshot.path}/${f.file})`}: ${fill(f.about)}`),
		'',
		'## Records (atproto lexicons)',
		'',
		'The source of truth is the network, not joblist: anyone can read the records from their authors\' accounts, and rebuild the snapshot with the indexer.',
		'',
		...lexicons(root).map((l) => `- [${l.id}](${config.source}/blob/main/${l.path}): ${l.description}`),
		'',
		'## Etiquette',
		'',
		...agents.etiquette.map((line) => `- ${fill(line)}`),
		'',
		'## Optional',
		'',
		...docs(root).map((d) => `- [${d.title}](${config.source}/blob/main/${d.path})`),
		`- [Source code](${config.source})`,
		`- [Embed an organization's jobs on a website](${config.url}${config.embed.page})`,
		''
	].join('\n');
}

/** The record types joblist reads (config.collections), with the first sentence of their own description. @param {string} root */
function lexicons(root) {
	const dir = 'lexicons/today/joblist';
	return readdirSync(join(root, dir))
		.filter((f) => f.endsWith('.json'))
		.map((f) => ({ path: `${dir}/${f}`, ...JSON.parse(readFileSync(join(root, dir, f), 'utf8')) }))
		.filter((l) => l.defs?.main?.type === 'record' && Object.values(config.collections).includes(l.id))
		.map((l) => ({ id: l.id, path: l.path, description: firstSentence(l.description || '') }));
}

/** The docs, by their title. @param {string} root */
function docs(root) {
	return readdirSync(join(root, 'docs'))
		.filter((f) => f.endsWith('.md'))
		.sort()
		.map((f) => ({ path: `docs/${f}`, title: readFileSync(join(root, 'docs', f), 'utf8').match(/^#\s+(.+)$/m)?.[1] || f }));
}

/** @param {string} text */
function firstSentence(text) {
	return text.match(/^.*?[.!?](?=\s|$)/)?.[0] || text;
}
