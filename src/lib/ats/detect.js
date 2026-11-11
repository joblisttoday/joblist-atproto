/**
 * Recognize job board links: which provider hosts a board, and its id.
 * Used to find a company's board from its website or careers page.
 */

/** Ids that are paths of the provider itself, not a company's board. */
const RESERVED = new Set(['', 'api', 'app', 'www', 'embed', 'v0', 'v1', 'jobs', 'job', 'static', 'assets', 'careers', 'login', 'signup', 'help']);

/**
 * One pattern per provider: a host test and where the id sits (the path's first part, the
 * subdomain, or what a path pattern captures). The public APIs' addresses too: a careers page
 * that shows its jobs itself fetches them from there (the add-on sees what a page fetched).
 * @type {{provider: string, host: RegExp, from: 'path' | 'subdomain' | RegExp}[]}
 */
const PATTERNS = [
	{ provider: 'greenhouse', host: /^boards-api\.greenhouse\.io$/, from: /^\/v1\/boards\/([^/?#]+)/ },
	{ provider: 'ashby', host: /^api\.ashbyhq\.com$/, from: /^\/posting-api\/job-board\/([^/?#]+)/ },
	{ provider: 'lever', host: /^api\.(eu\.)?lever\.co$/, from: /^\/v0\/postings\/([^/?#]+)/ },
	{ provider: 'workable', host: /^apply\.workable\.com$/, from: /^\/api\/v\d+\/(?:widget\/)?accounts\/([^/?#]+)/ },
	{ provider: 'smartrecruiters', host: /^api\.smartrecruiters\.com$/, from: /^\/v1\/companies\/([^/?#]+)/ },
	{ provider: 'rippling', host: /^api\.rippling\.com$/, from: /^\/platform\/api\/ats\/v\d+\/board\/([^/?#]+)/ },
	{ provider: 'greenhouse', host: /^(job-)?boards(\.eu)?\.greenhouse\.io$/, from: 'path' },
	{ provider: 'lever', host: /^jobs\.lever\.co$/, from: 'path' },
	{ provider: 'ashby', host: /^jobs\.ashbyhq\.com$/, from: 'path' },
	{ provider: 'workable', host: /^apply\.workable\.com$/, from: 'path' },
	{ provider: 'workable', host: /^[a-z0-9-]+\.workable\.com$/, from: 'subdomain' },
	{ provider: 'personio', host: /^[a-z0-9-]+\.jobs\.personio\.(de|com)$/, from: 'subdomain' },
	{ provider: 'recruitee', host: /^[a-z0-9-]+\.recruitee\.com$/, from: 'subdomain' },
	{ provider: 'smartrecruiters', host: /^(jobs|careers)\.smartrecruiters\.com$/, from: 'path' },
	{ provider: 'rippling', host: /^ats\.rippling\.com$/, from: 'path' }
];

/** Hosts of all known providers, to find their links in a page. */
const LINK = /(?:https?:)?\/\/[a-z0-9.-]+\.(?:greenhouse\.io|lever\.co|ashbyhq\.com|workable\.com|personio\.de|personio\.com|recruitee\.com|smartrecruiters\.com|rippling\.com)(?:[/?][^\s"'<>\\)]*)?/gi;

/**
 * The board a URL points to, if it is on a known provider.
 * @param {string} input
 * @returns {{provider: string, id: string} | null}
 */
export function detectBoard(input) {
	let url;
	try {
		url = new URL(input.startsWith('//') ? `https:${input}` : input);
	} catch {
		return null;
	}
	const host = url.hostname.toLowerCase();
	const pattern = PATTERNS.find((p) => p.host.test(host) && (!(p.from instanceof RegExp) || p.from.test(url.pathname)));
	if (!pattern) return null;
	// Greenhouse embeds name the board in a query: /embed/job_board?for=acme
	const embedded = url.searchParams.get('for');
	if (pattern.provider === 'greenhouse' && embedded) return { provider: 'greenhouse', id: embedded };
	const id =
		pattern.from instanceof RegExp
			? decodeURIComponent(url.pathname.match(pattern.from)?.[1] || '')
			: pattern.from === 'subdomain'
				? host.split('.')[0]
				: decodeURIComponent(url.pathname.split('/').filter(Boolean)[0] || '');
	if (RESERVED.has(id.toLowerCase())) return null;
	return { provider: pattern.provider, id };
}

/**
 * Boards linked from a page, most linked first.
 * @param {string} html
 * @returns {{provider: string, id: string, count: number}[]}
 */
export function findBoards(html) {
	/** @type {Map<string, {provider: string, id: string, count: number}>} */
	const found = new Map();
	for (const [match] of html.matchAll(LINK)) {
		const board = detectBoard(match.replace(/&amp;/g, '&'));
		if (!board) continue;
		const key = `${board.provider}:${board.id.toLowerCase()}`;
		const entry = found.get(key) || { ...board, count: 0 };
		entry.count++;
		found.set(key, entry);
	}
	return [...found.values()].sort((a, b) => b.count - a.count);
}

/** Whether a URL is hosted by a job board provider (not the company's own site). */
const PROVIDER_HOST = /(greenhouse\.io|lever\.co|ashbyhq\.com|workable\.com|personio\.(de|com)|recruitee\.com|smartrecruiters\.com|rippling\.com)$/i;

/** @param {string} input */
export function isProviderUrl(input) {
	try {
		return PROVIDER_HOST.test(new URL(input).hostname);
	} catch {
		return false;
	}
}
