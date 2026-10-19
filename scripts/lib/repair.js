/**
 * Heuristics proposing fixes for one company, from its health check:
 * - a new job board, found in links on its website or careers page;
 * - a website, for companies that have none, or whose website moved to a domain with the same name;
 * - a "likely gone" mark when nothing about it answers any more.
 * Every proposed board is checked live before it is proposed.
 */
import { detectBoard, findBoards, isProviderUrl } from '../../src/lib/ats/detect.js';
import { boardUrl } from '../../src/lib/models/company.js';
import { checkBoard } from './boards.js';
import { probe } from './http.js';
import { matchesName, siteOf } from './match.js';

/** Hosts that list other companies' jobs: their links say nothing about the company. */
const AGGREGATORS = /(jobsinberlin|stepstone|indeed|linkedin|xing|glassdoor|monster|angel\.co|wellfound|berlinstartupjobs|welcometothejungle|join\.com|jobs\.ch|cloudfront|facebook|twitter|instagram|youtube|google|apple|wikipedia|github)\./i;
/** Hosts of job board providers the app does not read: their pages are not the company's site. */
const OTHER_PROVIDERS = /(bamboohr|softgarden|taleo|jobvite|myworkdayjobs|workday|icims|successfactors|teamtailor|jobylon|onlyfy|dvinci|umantis|breezy|jazzhr|comeet|homerun|join)\./i;
/** @param {string} url */
const isCompanySite = (url) => !isProviderUrl(url) && !AGGREGATORS.test(new URL(url).hostname + '.') && !OTHER_PROVIDERS.test(new URL(url).hostname + '.');
/** Links that may lead to a careers page. */
const CAREERS_LINK = /href=["']([^"'#]*(?:career|jobs|karriere|stellen|join-us|joinus|work-with-us|hiring)[^"'#]*)["']/gi;
const PAGE_ANSWERS = ['ok', 'blocked'];
const BOARD_ANSWERS = ['live', 'empty'];

/** @param {any} page a page check from the report */
const answers = (page) => PAGE_ANSWERS.includes(page?.state);

/**
 * Same-site links that look like a careers page (at most two).
 * @param {string} html
 * @param {string} base
 */
function careersLinks(html, base) {
	const site = siteOf(new URL(base).hostname);
	const links = new Set();
	for (const [, href] of html.matchAll(CAREERS_LINK)) {
		try {
			const url = new URL(href.replace(/&amp;/g, '&'), base);
			if (url.protocol.startsWith('http') && siteOf(url.hostname) === site) links.add(url.href);
		} catch {
			// not a link
		}
		if (links.size >= 2) break;
	}
	return [...links];
}

/**
 * Pages to look at for board links: careers page, home page, and careers links of the home page.
 * @param {string[]} urls
 */
async function readPages(urls) {
	/** @type {{url: string, text: string}[]} */
	const pages = [];
	for (const url of urls) {
		const page = await probe(url, { body: true });
		if (page.text) pages.push({ url: page.finalUrl || url, text: page.text });
	}
	const home = pages.find((p) => !isProviderUrl(p.url));
	if (home) {
		for (const url of careersLinks(home.text, home.url)) {
			if (pages.some((p) => p.url === url)) continue;
			const page = await probe(url, { body: true });
			if (page.text) pages.push({ url: page.finalUrl || url, text: page.text });
		}
	}
	return pages;
}

/**
 * A working board linked from the company's pages.
 * @param {Record<string, any>} record
 * @param {any} check the company's health check
 * @param {string[]} names
 */
export async function findBoard(record, check, names) {
	const current = record.jobBoard || {};
	const urls = [current.url, check.website?.state === 'ok' ? record.url : null].filter(Boolean);
	/** @type {{provider: string, id: string, count: number}[]} */
	const candidates = [];
	const direct = current.url ? detectBoard(current.url) : null;
	if (direct) candidates.push({ ...direct, count: 1 });
	for (const page of await readPages(urls)) candidates.push(...findBoards(page.text));
	const seen = new Set();
	for (const candidate of candidates) {
		const key = `${candidate.provider}:${candidate.id.toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		if (candidate.provider === current.provider && candidate.id.toLowerCase() === current.id?.toLowerCase()) continue;
		const board = await checkBoard(candidate);
		if (!BOARD_ANSWERS.includes(board.state)) continue;
		const named = matchesName(candidate.id, names);
		// A page linking several boards (investors, partners) needs the name to match.
		if (!named && new Set(candidates.map((c) => c.id.toLowerCase())).size > 1) continue;
		return { board, confidence: named || direct ? 'high' : 'low' };
	}
	return null;
}

/**
 * A website for a company that has none: from its careers page address,
 * or from a link on its job board page that carries its name.
 * @param {Record<string, any>} record
 * @param {string[]} names
 */
async function findWebsite(record, names) {
	const careers = record.jobBoard?.url;
	if (careers && isCompanySite(careers)) {
		// jobs.acme.com → acme.com first, then the careers host itself
		const host = new URL(careers).hostname;
		const site = siteOf(host);
		const named = matchesName(site.split('.')[0], names);
		for (const candidate of new Set([site, host.replace(/^www\./, '')])) {
			const page = await probe(`https://${candidate}`);
			if (answers(page)) return { url: `https://${candidate}`, from: 'careers page address', confidence: named ? 'high' : 'low' };
		}
	}
	const board = boardUrl(record.jobBoard);
	if (!board) return null;
	const page = await probe(board, { body: true });
	if (!page.text) return null;
	const linked = new Set();
	for (const [, href] of page.text.matchAll(/(?:href=|"publicWebsite":)["'](https?:\/\/[^"']+)["']/gi)) {
		try {
			const host = new URL(href).hostname;
			if (isCompanySite(href) && matchesName(siteOf(host).split('.')[0], names)) linked.add(siteOf(host));
		} catch {
			// not a link
		}
	}
	if (linked.size !== 1) return null;
	const [site] = linked;
	const home = await probe(`https://${site}`);
	if (!answers(home)) return null;
	return { url: `https://${site}`, from: 'job board page', confidence: 'high' };
}

/**
 * Proposed changes for one company.
 * @param {import('./network.js').RepoRecord} record
 * @param {any} check its entry in the health report
 */
export async function proposeRepair(record, check) {
	const v = record.value;
	const names = [v.name, record.rkey, v.url ? siteOf(new URL(v.url).hostname).split('.')[0] : ''].filter(Boolean);
	const boardOk = BOARD_ANSWERS.includes(check.board?.state);
	const boardLive = check.board?.state === 'live';
	/** @type {Record<string, any>} */
	const proposal = { uri: record.uri, did: record.did, rkey: record.rkey, name: v.name, changes: {}, notes: [] };

	if (!v.url) {
		const website = await findWebsite(v, names);
		if (website) {
			proposal.changes.url = website.url;
			proposal.notes.push(`website from ${website.from} (${website.confidence})`);
			proposal.confidence = website.confidence;
			v.url = website.url;
			check = { ...check, website: { state: 'ok' } };
		}
	}

	if (!boardLive && (v.url || v.jobBoard?.url)) {
		const found = await findBoard(v, check, names);
		// An empty board only replaces a board and careers page that both stopped answering.
		if (found && (found.board.state === 'live' || (!boardOk && !answers(check.careers)))) {
			proposal.changes.jobBoard = { provider: found.board.provider, id: found.board.id };
			proposal.notes.push(
				`board ${found.board.provider}:${found.board.id} is ${found.board.state}${found.board.jobs ? ` (${found.board.jobs} jobs)` : ''}, was ${describeBoard(v.jobBoard, check)} (${found.confidence})`
			);
			proposal.confidence = proposal.confidence === 'low' ? 'low' : found.confidence;
		}
	}

	const movedTo = check.website?.state === 'ok' ? check.website.redirectedTo : undefined;
	if (movedTo) {
		proposal.notes.push(`website now redirects to ${movedTo}`);
		// A new domain carrying the same name is a move (acme.de → acme.com); another name is a person's call (acquired, renamed).
		if (!proposal.changes.url && isMove(v.url, movedTo) && matchesName(siteOf(movedTo).split('.')[0], names)) {
			proposal.changes.url = `https://${movedTo}`;
			proposal.confidence = proposal.confidence || 'high';
		}
	}

	// Without a website we cannot tell a closed company from a moved careers page.
	// "Gone" needs two signals: a board or careers page that existed and stopped answering, and a dead website.
	const boardGone = Boolean(v.jobBoard) && !boardOk && !answers(check.careers) && !proposal.changes.jobBoard;
	if (boardGone && ['unreachable', 'missing', 'parked'].includes(check.website?.state)) {
		proposal.gone = true;
		proposal.notes.push('likely gone: its website, job board and careers page do not answer');
	} else if (boardGone && !v.url) {
		proposal.stale = true;
		proposal.notes.push('needs a person: no website known, and its job board or careers page does not answer');
	}
	return proposal;
}

/**
 * Whether a redirect is a move of the whole site: to a registered domain
 * (not a portal.x.com page), and not just to a country's version of it
 * (acme.com → acme.fr depends on where the visitor is).
 * @param {string} from the website
 * @param {string} to the host it redirects to
 */
export function isMove(from, to) {
	if (siteOf(to) !== to) return false;
	const [fromLabel, ...fromTld] = siteOf(new URL(from).hostname).split('.');
	const [toLabel, ...toTld] = to.split('.');
	const countryOnly = fromLabel === toLabel && toTld.join('.') !== 'com' && toTld.at(-1)?.length === 2;
	return !countryOnly || fromTld.join('.') === toTld.join('.');
}

/** @param {any} jobBoard @param {any} check */
function describeBoard(jobBoard, check) {
	if (jobBoard?.provider) return `${jobBoard.provider}:${jobBoard.id} ${check.board?.state}`;
	if (jobBoard?.url) return `careers page ${check.careers?.state}`;
	return 'none';
}
