/**
 * The trends behind /stats: jobs first seen and closed each week, by field and
 * city, and what the open jobs say now (where the work happens, pay, how long
 * jobs stay open). Counts only: no company, no person.
 *
 * Weeks come from the ledger (ledger.js): it knows the offers seen since it started
 * (`since`), and forgets one config.ledger.keepDays after it was last seen. So weeks are
 * counted from its start only, the last ones again each run; older weeks are kept from
 * the last stats file: the history grows from there, never from guesses.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { unpackSalary } from '../src/lib/ats/salary.js';
import { fieldsOf } from '../src/lib/models/landing.js';
import { citiesOf } from './landing.js';

/**
 * @typedef {import('./ledger.js').Ledger} Ledger
 * @typedef {import('./jobs.js').IndexedJob} IndexedJob
 * @typedef {{week: string, new: number, closed: number, open: number, partial?: true, fields: Record<string, number>, cities: Record<string, number>}} Week
 *   week: its Monday (UTC); new and closed: offers first seen, last seen that week; open: at its end
 *   (now, for the week under way: partial); fields, cities: new offers by field and city slug.
 * @typedef {{generatedAt: string, since: string, weeks: Week[], now: Now}} Stats
 *   since: when counting started (the ledger's first run); its week counts from then only.
 * @typedef {{open: number, companies: number, newWeek: number, newWeekBefore: number | null, daysOpen: number | null,
 *   workplace: Record<'onsite' | 'hybrid' | 'remote' | 'unsaid', number>, payShown: number,
 *   fields: {slug: string, open: number, daysOpen: number | null, pay: Record<string, number>}[],
 *   cities: {slug: string, name: string, open: number}[]}} Now
 *   newWeek, newWeekBefore: offers first seen in the last 7 days, the 7 before (null before counting
 *   covers them); daysOpen: median days an offer that closed lately stayed open (null: too few closed);
 *   pay: median yearly pay (middle of the range), by currency.
 */

const DAY = 864e5;

/** Monday 00:00 UTC of a date's week, as "2026-11-02". @param {number} ms */
export function weekOf(ms) {
	const d = new Date(ms);
	const back = (d.getUTCDay() + 6) % 7;
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - back)).toISOString().slice(0, 10);
}

/** @param {Map<string, number[]>} map @param {string} key @param {number} value */
function push(map, key, value) {
	const list = map.get(key);
	if (list) list.push(value);
	else map.set(key, [value]);
}

/** @param {number[]} values */
function median(values) {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = sorted.length >> 1;
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * An offer as the ledger keys it (company, title, place), read back.
 * @param {string} key
 */
function offerOf(key) {
	const [c, t = '', l = ''] = key.split('\n');
	return { c, t, l };
}

/**
 * @param {{ledger: Ledger, previous: Partial<Stats> | null, jobs: IndexedJob[], places: import('./places.js').PlaceCache,
 *   cities: {slug: string, name: string, count: number}[], generatedAt: string}} input
 *   ledger: after this run; cities: those with a page (landing index), most jobs first
 * @returns {Stats}
 */
export function statsFile({ ledger, previous, jobs, places, cities, generatedAt }) {
	const now = Date.parse(generatedAt);
	const runMinute = new Date(now).toISOString().slice(0, 16) + 'Z';
	const since = typeof previous?.since === 'string' && Date.parse(previous.since) ? previous.since : ledgerStart(ledger, runMinute);
	const forgets = now - config.ledger.keepDays * DAY;
	// The weeks the ledger has whole: those starting after it forgets (the week it started: from then).
	const firstWhole = Math.max(Date.parse(weekOf(forgets)) < forgets ? Date.parse(weekOf(forgets)) + 7 * DAY : Date.parse(weekOf(forgets)), Date.parse(weekOf(Date.parse(since))));
	const current = Date.parse(weekOf(now));
	/** @type {Map<string, Week>} */
	const weeks = new Map();
	for (let at = firstWhole; at <= current; at += 7 * DAY) {
		const week = new Date(at).toISOString().slice(0, 10);
		weeks.set(week, { week, new: 0, closed: 0, open: 0, ...(at === current && { partial: /** @type {true} */ (true) }), fields: {}, cities: {} });
	}
	const ends = [...weeks.values()].map((w) => Math.min(Date.parse(w.week) + 7 * DAY, now));
	/** Days each offer that closed lately stayed open, and by field. */
	const lasted = { all: /** @type {number[]} */ ([]), byField: /** @type {Map<string, number[]>} */ (new Map()) };
	let newWeek = 0;
	let newWeekBefore = 0;
	const cityName = new Map(cities.map((c) => [c.slug, c.name]));
	/** The cities of each place, read once (many offers share one). @type {Map<string, string[]>} */
	const placeCities = new Map();
	/** @param {string} place */
	const citiesIn = (place) => {
		let found = placeCities.get(place);
		if (!found) placeCities.set(place, (found = citiesOf({ t: '', u: '', c: '', l: place }, places).map((c) => c.slug)));
		return found;
	};

	for (const [key, [first, last]] of Object.entries(ledger)) {
		const from = Date.parse(first);
		const to = Date.parse(last);
		if (!Number.isFinite(from) || !Number.isFinite(to)) continue;
		const closed = last !== runMinute;
		if (from > now - 7 * DAY) newWeek++;
		else if (from > now - 14 * DAY) newWeekBefore++;
		const offer = offerOf(key);
		const fields = fieldsOf({ t: offer.t });
		const startWeek = weeks.get(weekOf(from));
		if (startWeek) {
			startWeek.new++;
			for (const f of fields) startWeek.fields[f] = (startWeek.fields[f] || 0) + 1;
			for (const slug of citiesIn(offer.l)) {
				if (cityName.has(slug)) startWeek.cities[slug] = (startWeek.cities[slug] || 0) + 1;
			}
		}
		if (closed) {
			const endWeek = weeks.get(weekOf(to));
			if (endWeek) endWeek.closed++;
			const days = (to - from) / DAY;
			lasted.all.push(days);
			for (const f of fields) push(lasted.byField, f, days);
		}
		// Open at the end of each week: first seen before it, still seen at it.
		[...weeks.values()].forEach((w, i) => {
			if (from < ends[i] && (to >= ends[i] || !closed)) w.open++;
		});
	}
	// Few new offers in a city that week: left out (the file stays small).
	for (const w of weeks.values()) w.cities = Object.fromEntries(Object.entries(w.cities).filter(([, n]) => n >= config.stats.weekCityMin));

	const kept = (Array.isArray(previous?.weeks) ? previous.weeks : []).filter((w) => w && typeof w.week === 'string' && Date.parse(w.week) < firstWhole && !w.partial);
	const all = [...kept, ...weeks.values()].sort((a, b) => a.week.localeCompare(b.week)).slice(-config.stats.weeks);

	const covered = (/** @type {number} */ days) => Date.parse(since) <= now - days * DAY;
	return { generatedAt, since, weeks: all, now: openNow(jobs, cities, lasted, newWeek, covered(14) ? newWeekBefore : null) };
}

/**
 * When the ledger started: the earliest time it last saw an offer (it keeps them a while).
 * @param {Ledger} ledger
 * @param {string} fallback
 */
function ledgerStart(ledger, fallback) {
	let start = fallback;
	for (const [, last] of Object.values(ledger)) if (last && last < start) start = last;
	return start;
}

/**
 * @param {IndexedJob[]} jobs
 * @param {{slug: string, name: string, count: number}[]} cities
 * @param {{all: number[], byField: Map<string, number[]>}} lasted
 * @param {number} newWeek
 * @param {number | null} newWeekBefore
 * @returns {Now}
 */
function openNow(jobs, cities, lasted, newWeek, newWeekBefore) {
	const workplace = { onsite: 0, hybrid: 0, remote: 0, unsaid: 0 };
	/** @type {Map<string, {open: number, pay: Map<string, number[]>}>} */
	const fields = new Map();
	let payShown = 0;
	for (const job of jobs) {
		const r = /** @type {keyof typeof workplace} */ (job.r);
		workplace[r in workplace && r !== 'unsaid' ? r : 'unsaid']++;
		const salary = unpackSalary(job.m);
		if (salary) payShown++;
		const yearly = salary?.period === 'year' ? ((salary.min ?? salary.max ?? 0) + (salary.max ?? salary.min ?? 0)) / 2 : 0;
		for (const slug of fieldsOf(job)) {
			const field = fields.get(slug) || { open: 0, pay: new Map() };
			field.open++;
			if (salary && yearly) push(field.pay, salary.currency, yearly);
			fields.set(slug, field);
		}
	}
	return {
		open: jobs.length,
		companies: new Set(jobs.map((j) => j.c)).size,
		newWeek,
		newWeekBefore,
		daysOpen: lasted.all.length >= config.stats.minSample ? round(median(lasted.all)) : null,
		workplace,
		payShown,
		fields: [...fields]
			.map(([slug, f]) => ({
				slug,
				open: f.open,
				daysOpen: (lasted.byField.get(slug)?.length || 0) >= config.stats.minSample ? round(median(lasted.byField.get(slug) || [])) : null,
				pay: Object.fromEntries(
					[...f.pay]
						.filter(([, values]) => values.length >= config.stats.minSample)
						.map(([currency, values]) => [currency, Math.round(/** @type {number} */ (median(values)) / 1000) * 1000])
				)
			}))
			.sort((a, b) => b.open - a.open),
		cities: cities.slice(0, config.stats.cities).map(({ slug, name, count }) => ({ slug, name, open: count }))
	};
}

/** @param {number | null} n */
const round = (n) => (n === null ? null : Math.round(n));
