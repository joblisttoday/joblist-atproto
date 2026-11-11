/**
 * joblist's historical companies (github.com/joblisttoday/data):
 * one folder per company slug, each with an index.json.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { toDomain } from '../../src/lib/models/company.js';

/**
 * A valid record key from an old joblist slug ('charité' → 'charite').
 * @param {string} slug
 */
export function toKey(slug) {
	return slug
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^A-Za-z0-9._:~-]/g, '-');
}

/** @param {string} url */
export function isUrl(url) {
	try {
		return ['http:', 'https:'].includes(new URL(url).protocol);
	} catch {
		return false;
	}
}

/**
 * The old companies with their record key: the website's domain,
 * or the slug when there is none or another company already has it.
 * @param {string} dir
 * @returns {{slug: string, rkey: string, data: any}[]}
 */
export function readLegacyCompanies(dir) {
	/** @type {Set<string>} */
	const taken = new Set();
	const companies = [];
	for (const slug of readdirSync(dir).sort()) {
		const file = join(dir, slug, 'index.json');
		if (!existsSync(file)) continue;
		const data = JSON.parse(readFileSync(file, 'utf8'));
		if (!data.title) continue;
		const domain = isUrl(data.company_url) ? toDomain(data.company_url) : '';
		const rkey = domain && !taken.has(domain) ? domain : toKey(slug);
		taken.add(rkey);
		companies.push({ slug, rkey, data });
	}
	return companies;
}

/**
 * Cloudflare `_redirects` lines from the old company pages (/<slug>)
 * to the new ones (/<rkey>: an organization's page is its domain), skipping slugs the app routes itself.
 * @param {{slug: string, rkey: string}[]} companies
 * @param {string[]} reserved top-level route names
 */
export function toRedirects(companies, reserved) {
	return companies
		.filter(({ slug }) => !reserved.includes(slug))
		.map(({ slug, rkey }) => `/${encodeURI(slug)} /${encodeURIComponent(rkey)} 301`);
}
