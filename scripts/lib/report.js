/**
 * The crawl's public files, published with the snapshot under /snapshot/crawl/:
 * health.json (one entry per company, for "board not responding · checked <date>")
 * and proposals.json (what the crawler proposed, wrote and skipped, and why).
 * Shapes are documented in docs/crawler.md.
 */

/**
 * @param {string} checkedAt
 * @param {any[]} checks health checks of the shown versions (scripts/lib/health.js)
 * @param {Map<string, any>} repairsByKey proposals of scripts/lib/repair.js
 */
export function healthFile(checkedAt, checks, repairsByKey) {
	/** @type {Record<string, any>} */
	const companies = {};
	for (const c of checks) {
		/** @type {Record<string, any>} */
		const entry = { version: c.uri };
		if (c.website) entry.website = c.website.state;
		if (c.website?.redirectedTo) entry.movedTo = c.website.redirectedTo;
		if (c.board) {
			entry.board = c.board.state;
			if (c.board.jobs !== undefined) entry.jobs = c.board.jobs;
		}
		if (c.careers) entry.careers = c.careers.state;
		const repair = repairsByKey.get(c.rkey);
		if (repair?.gone) entry.gone = true;
		if (repair?.stale) entry.needsAPerson = true;
		if (repair && Object.keys(repair.changes).length) entry.proposal = { ...repair.changes, confidence: repair.confidence };
		companies[c.rkey] = entry;
	}
	return { checkedAt, companies };
}
