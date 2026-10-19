/**
 * Describe a company we only know by its domain (a key in a list, or the
 * handle of an account posting about hiring): its name, website and a live
 * job board. Proposed only when the board is linked from its own website or
 * found in Open Jobs and linking back, and carries its name.
 */
import { probe } from './http.js';
import { matchesName, siteOf } from './match.js';
import { findOpenJobsBoard } from './openjobs.js';
import { findBoard } from './repair.js';

/**
 * The site's own name: og:site_name, else the first part of its title.
 * @param {string} html
 */
export function siteName(html) {
	const decode = (/** @type {string} */ s) => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
	const og = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
	if (og) return decode(og[1]);
	const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
	return title ? decode(title[1]).split(/\s[|–—·:-]\s/)[0].trim() : '';
}

/**
 * @param {string} domain the record key it would get
 * @param {{name?: string, source: string, openJobs: import('./openjobs.js').OpenJobsIndex | null}} options
 * @returns {Promise<{found?: import('./plan.js').Discovery, reason?: string}>}
 */
export async function discoverCompany(domain, { name, source, openJobs }) {
	if (!domain.includes('.')) return { reason: 'not a domain' };
	const url = `https://${domain}`;
	const page = await probe(url, { body: true });
	if (page.state !== 'ok' || !page.text) return { reason: `website ${page.state}` };
	const landed = page.finalUrl ? new URL(page.finalUrl).hostname : domain;
	if (siteOf(landed) !== siteOf(domain)) return { reason: `website redirects to ${landed}` };
	const label = siteOf(domain).split('.')[0];
	const title = name || siteName(page.text) || label;
	const names = [title, label];

	const linked = await findBoard({ url }, { website: { state: 'ok' } }, names);
	let board = linked?.confidence === 'high' && matchesName(linked.board.id, names) ? linked.board : null;
	let via = 'linked from its website';
	if (!board && openJobs) {
		board = await findOpenJobsBoard(openJobs, names, siteOf(domain));
		via = 'Open Jobs, linking back to its website';
	}
	if (!board || board.state !== 'live') return { reason: 'no live job board found' };
	return {
		found: {
			key: domain,
			value: { name: title.slice(0, 100), url, jobBoard: { provider: board.provider, id: board.id } },
			confidence: 'high',
			source,
			notes: [`board ${board.provider}:${board.id} (${board.jobs} jobs) ${via}`]
		}
	};
}
