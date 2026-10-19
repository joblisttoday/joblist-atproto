/**
 * Give every list and company its own HTML file, with a real title,
 * description and link-preview tags, and the content as plain HTML for
 * readers that do not run JavaScript (link previews, search engines, LLMs).
 * The app then starts as usual on top of it.
 *
 *   node indexer/prerender.js [build-dir] [snapshot-dir]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { toCompany } from '../src/lib/models/company.js';
import { toList } from '../src/lib/models/list.js';
import { escape, page } from './html.js';

const [build = 'build', snapshot = 'static/snapshot'] = process.argv.slice(2);
const template = readFileSync(join(build, 'index.html'), 'utf8');
const { companyRecords, listRecords, profiles: profileObject } = JSON.parse(
	readFileSync(join(snapshot, 'records.json'), 'utf8')
);
const { jobs } = JSON.parse(readFileSync(join(snapshot, 'jobs.json'), 'utf8'));
const profiles = new Map(Object.entries(profileObject));
const handleOf = (/** @type {string} */ did) => profiles.get(did)?.handle || did;

/** @type {Map<string, any[]>} */
const versionsByKey = new Map();
for (const r of companyRecords) {
	if (r.value?.name) versionsByKey.set(r.rkey, [...(versionsByKey.get(r.rkey) || []), r]);
}
const companies = new Map([...versionsByKey].map(([key, versions]) => [key, toCompany(versions, profiles, null)]));
/** @type {Map<string, number>} */
const jobCounts = new Map();
for (const job of jobs) jobCounts.set(job.c, (jobCounts.get(job.c) || 0) + 1);

/** @param {string} path @param {string} html */
function write(path, html) {
	mkdirSync(join(build, path), { recursive: true });
	writeFileSync(join(build, path, 'index.html'), html);
}

let count = 0;
for (const record of listRecords) {
	if (!record.value?.name) continue;
	const list = toList(record);
	const members = list.companies.map((key) => companies.get(key)).filter(Boolean);
	const open = members.reduce((n, c) => n + (jobCounts.get(c.key) || 0), 0);
	const path = `/${handleOf(list.did)}/${list.rkey}`;
	const summary = `${members.length} companies, ${open} open jobs. ${list.description || ''}`.trim();
	write(
		path,
		page(template, {
			title: `${list.name} · ${config.name}`,
			description: summary,
			url: config.url + path,
			body: `<h1>${escape(list.name)}</h1><p>${escape(summary)}</p><p>${escape(en['list.by'])} @${escape(handleOf(list.did))}</p><ul>${members
				.map((c) => `<li><a href="/company/${escape(c.key)}">${escape(c.name)}</a></li>`)
				.join('')}</ul>`
		})
	);
	count++;
}

for (const company of companies.values()) {
	const path = `/company/${company.key}`;
	const open = jobCounts.get(company.key) || 0;
	const places = [...new Set(company.locations.map((l) => l.name).filter(Boolean))].join(', ');
	const description = [company.description, places, open ? `${open} open jobs` : ''].filter(Boolean).join(' · ');
	write(
		path,
		page(template, {
			title: `${company.name} · ${config.name}`,
			description,
			url: config.url + path,
			body: `<h1>${escape(company.name)}</h1><p>${escape(description)}</p>${
				company.url ? `<p><a href="${escape(company.url)}">${escape(company.url)}</a></p>` : ''
			}<ul>${jobs
				.filter((/** @type {any} */ j) => j.c === company.key)
				.slice(0, 200)
				.map((/** @type {any} */ j) => `<li><a href="${escape(j.u)}">${escape(j.t)}</a> ${escape(j.l || '')}</li>`)
				.join('')}</ul>`
		})
	);
	count++;
}

writeFileSync(
	join(build, 'index.html'),
	page(template, { title: config.name, description: en['home.intro'], url: config.url, body: '' })
);
console.log(`prerendered ${count} pages`);
