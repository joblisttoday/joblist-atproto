/**
 * Open Jobs' list of job boards (elliottdehn/open-jobs, CC0), as a lookup:
 * board ids are only ever matched to a company we already know by name and
 * domain, and every match is checked live and must link back to the domain.
 * Never a source of companies on its own.
 */
import { boardUrl } from '../../src/lib/models/company.js';
import { checkBoard } from './boards.js';
import { probe } from './http.js';
import { normalize } from './match.js';

/** Providers the app reads, by their Open Jobs name. */
const PROVIDERS = ['ashby', 'greenhouse', 'lever', 'personio', 'recruitee', 'smartrecruiters', 'workable'];

/** @typedef {Map<string, {provider: string, id: string}[]>} OpenJobsIndex normalized id → boards */

/**
 * Live boards of slugs.json, indexed by normalized id.
 * @param {string} url pinned to a commit, so every run reads the same file
 * @returns {Promise<OpenJobsIndex>}
 */
export async function loadOpenJobs(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Open Jobs slugs.json: ${res.status}`);
	const { ats } = await res.json();
	/** @type {OpenJobsIndex} */
	const index = new Map();
	for (const provider of PROVIDERS) {
		for (const id of ats[provider] || []) {
			const key = normalize(id);
			if (key.length < 3) continue;
			index.set(key, [...(index.get(key) || []), { provider, id }]);
		}
	}
	return index;
}

/**
 * Whether a board's page links to the company's site.
 * @param {{provider: string, id: string}} board
 * @param {string} site e.g. 'acme.com'
 */
export async function boardLinksTo(board, site) {
	const page = await probe(boardUrl(board), { body: true });
	if (!page.text) return false;
	const escaped = site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`[/."@]${escaped}(?![a-z0-9-])`, 'i').test(page.text);
}

/**
 * A live board of Open Jobs whose id is exactly one of the names and whose page links to the site.
 * @param {OpenJobsIndex} index
 * @param {string[]} names
 * @param {string} site
 */
export async function findOpenJobsBoard(index, names, site) {
	const candidates = [...new Set(names.map(normalize))].flatMap((name) => index.get(name) || []);
	for (const candidate of candidates) {
		const board = await checkBoard(candidate);
		if (board.state !== 'live') continue;
		if (await boardLinksTo(candidate, site)) return board;
	}
	return null;
}
