/**
 * Pay ranges as job boards give them, made one shape: what the job pays,
 * in what currency, per what. Nothing is guessed from the description.
 *
 * @typedef {'year' | 'month' | 'week' | 'day' | 'hour'} PayPeriod
 * @typedef {{min?: number, max?: number, currency: string, period: PayPeriod}} Salary
 *   min, max: in the currency's units (not cents); one of them at least.
 */

/** @type {PayPeriod[]} */
export const payPeriods = ['year', 'month', 'week', 'day', 'hour'];

/** @param {unknown} value */
function amount(value) {
	const n = typeof value === 'string' ? Number(value.replace(/[\s,]/g, '')) : Number(value);
	return value !== null && value !== '' && Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * A salary from loose values, or undefined when it says nothing usable.
 * @param {{min?: unknown, max?: unknown, currency?: unknown, period?: unknown}} pay
 * @returns {Salary | undefined}
 */
export function toSalary({ min, max, currency, period }) {
	let low = amount(min);
	let high = amount(max);
	const code = String(currency || '').toUpperCase();
	const per = /** @type {PayPeriod} */ (String(period || '').toLowerCase());
	if ((!low && !high) || !/^[A-Z]{3}$/.test(code) || !payPeriods.includes(per)) return undefined;
	if (low && high && low > high) [low, high] = [high, low];
	/** @type {Salary} */
	const salary = { currency: code, period: per };
	if (low) salary.min = low;
	if (high) salary.max = high;
	return salary;
}

/**
 * Several ranges of one job (per level, per country…) as one: the first one's
 * currency and period, from the lowest to the highest of those in them.
 * @param {(Salary | undefined)[]} ranges
 * @returns {Salary | undefined}
 */
export function oneRange(ranges) {
	const known = /** @type {Salary[]} */ (ranges.filter(Boolean));
	const [first] = known;
	if (!first) return undefined;
	const same = known.filter((r) => r.currency === first.currency && r.period === first.period);
	const lows = same.map((r) => r.min ?? r.max ?? 0);
	const highs = same.map((r) => r.max ?? r.min ?? 0);
	const min = Math.min(...lows);
	const max = Math.max(...highs);
	return { currency: first.currency, period: first.period, ...(min ? { min } : {}), ...(max && max !== min ? { max } : {}) };
}

/**
 * The period of an interval as boards write it: "1 YEAR" (Ashby), "per-hour-wage" (Lever), "monthly".
 * @param {unknown} interval
 * @returns {PayPeriod | undefined}
 */
export function toPeriod(interval) {
	const text = String(interval || '').toLowerCase();
	// Every two weeks, every 3 months…: no period people compare.
	if (/bi-?week|^\s*([2-9]|\d{2,})\s/.test(text)) return undefined;
	if (/hour/.test(text)) return 'hour';
	if (/day|daily/.test(text)) return 'day';
	if (/week/.test(text)) return 'week';
	if (/month/.test(text)) return 'month';
	if (/year|annual|annum/.test(text)) return 'year';
	return undefined;
}

/**
 * Compact, for jobs.json: [min, max, currency, period], 0 for an unknown bound.
 * @param {Salary | undefined} salary
 * @returns {[number, number, string, PayPeriod] | undefined}
 */
export function packSalary(salary) {
	return salary ? [salary.min || 0, salary.max || 0, salary.currency, salary.period] : undefined;
}

/**
 * A salary as jobs.json keeps it, checked (the file is read from the network).
 * @param {unknown} packed
 */
export function unpackSalary(packed) {
	if (!Array.isArray(packed)) return undefined;
	const [min, max, currency, period] = packed;
	return toSalary({ min, max, currency, period });
}
