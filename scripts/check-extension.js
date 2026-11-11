/**
 * How well the browser add-on reads real organizations' websites: for organizations joblist
 * knows with a Bluesky account on their domain and a job board, it opens each homepage (and
 * its own careers link, once), reads them as the add-on does (extension/src/collect.js,
 * src/lib/models/page-read.js), and compares with what joblist knows: whether joblist knows
 * it, its Bluesky account, its job board (found, and never another one).
 * Two pages per organization, a few at a time: by hand, not in CI. Needs Playwright's Chromium.
 * Run: node scripts/check-extension.js [count=15]
 */
import { chromium } from '@playwright/test';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { collectPage } from '../extension/src/collect.js';
import { readPage } from '../src/lib/models/page-read.js';
import { bluesky } from '../src/lib/network/bluesky-account.js';

const count = Number(process.argv[2]) || 15;
const snapshot = config.snapshot.path;
const [records, accounts] = await Promise.all([
	fetch(`${snapshot}/records.json`).then((r) => r.json()),
	fetch(`${snapshot}/${config.bluesky.file}`).then((r) => r.json())
]);
/** @type {Map<string, any>} organizations by domain */
const byKey = new Map(
	records.companyRecords.filter((/** @type {any} */ c) => c.value.url).map((/** @type {any} */ c) => [new URL(c.value.url).hostname.replace(/^www\./, ''), c.value])
);
const keys = Object.keys(accounts.accounts || accounts)
	.filter((key) => byKey.get(key)?.jobBoard?.provider)
	.slice(0, count);

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'en-US' });
const tally = { known: 0, bluesky: 0, board: 0, wrongBoard: 0, socials: 0 };
for (const key of keys) {
	const want = byKey.get(key).jobBoard;
	const wanted = `${want.provider}:${String(want.id).toLowerCase()}`;
	const page = await context.newPage();
	/** @type {string[]} */
	const boards = [];
	let socials = '';
	try {
		await page.goto(`https://${key}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
		await page.waitForTimeout(3000);
		const home = readPage(await page.evaluate(collectPage));
		boards.push(...(home?.boards || []).map((b) => `${b.provider}:${b.id.toLowerCase()}`));
		socials = (home?.socials || []).map((s) => s.id).join(',');
		const careers = await page.evaluate(() =>
			[...document.querySelectorAll('a[href]')]
				.map((a) => /** @type {HTMLAnchorElement} */ (a).href)
				.find((href) => {
					try {
						const url = new URL(href);
						return /\/(careers|jobs|join|work-with-us|karriere)(\/|$)/i.test(url.pathname) || /^(careers|jobs)\./.test(url.hostname);
					} catch {
						return false;
					}
				})
		);
		if (careers) {
			await page.goto(careers, { waitUntil: 'domcontentloaded', timeout: 25000 });
			await page.waitForTimeout(4000);
			boards.push(...(readPage(await page.evaluate(collectPage))?.boards || []).map((b) => `${b.provider}:${b.id.toLowerCase()}`));
		}
	} catch (err) {
		socials = `(not read: ${String(err).slice(0, 40)})`;
	}
	await page.close();
	const account = await bluesky(key);
	const known = (await fetch(`${snapshot}/${config.embed.dir}/${encodeURIComponent(key)}.json`)).ok;
	const found = [...new Set(boards)];
	tally.known += Number(known);
	tally.bluesky += Number(Boolean(account));
	tally.socials += Number(Boolean(socials) && !socials.startsWith('('));
	if (found.includes(wanted)) tally.board++;
	else if (found.length) tally.wrongBoard++;
	console.log(`${key.padEnd(24)} ${known ? 'known' : 'NOT KNOWN'}  bluesky:${account ? 'yes' : 'no'}  board:${found.includes(wanted) ? 'yes' : found.length ? `WRONG ${found[0]}` : '-'}  ${socials}`);
}
await browser.close();
console.log(`\nof ${keys.length}: known ${tally.known}, bluesky ${tally.bluesky}, board ${tally.board} (wrong ${tally.wrongBoard}), social links ${tally.socials}`);
