import company from '../../../lexicons/today/joblist/company.json' with { type: 'json' };
import job from '../../../lexicons/today/joblist/job.json' with { type: 'json' };
import list from '../../../lexicons/today/joblist/list.json' with { type: 'json' };
import suggestion from '../../../lexicons/today/joblist/suggestion.json' with { type: 'json' };

/**
 * Records from other accounts, kept within their lexicon's limits: what anyone can
 * write is never trusted to be the right shape or size. Strings are cut to their
 * maxGraphemes (else maxLength), arrays to their maxLength; codes, links and dates
 * past their limits, values of the wrong type and fields not in the lexicon are left out. The lexicons in lexicons/ are the limits.
 *
 * @typedef {{type: string, ref?: string, format?: string, items?: Schema, properties?: Record<string, Schema>, record?: Schema, minLength?: number, maxLength?: number, maxGraphemes?: number}} Schema
 * @typedef {{id: string, defs: Record<string, Schema>}} Lexicon
 */

/** The longest a link, date or other formatted string can be in atproto (a uri: 8 KB). */
const FORMAT_MAX = 8192;

/** @type {Map<string, Lexicon>} */
const LEXICONS = new Map(/** @type {Lexicon[]} */ ([company, job, list, suggestion]).map((l) => [l.id, l]));

/**
 * A string cut to `max` characters (code points: a character is never split in half).
 * @param {string} value
 * @param {number} max
 */
export function cutText(value, max) {
	if (value.length <= max) return value;
	// A very long string is first shortened cheaply (a code point is at most 2 units).
	return Array.from(value.slice(0, max * 2)).slice(0, max).join('');
}

/**
 * @param {string} ref "#def" or "nsid#def"
 * @param {Lexicon} lexicon the one the ref is written in
 * @returns {[Lexicon, Schema] | null}
 */
function resolve(ref, lexicon) {
	const [nsid, def = 'main'] = ref.split('#');
	const target = nsid ? LEXICONS.get(nsid) : lexicon;
	const schema = target?.defs[def];
	return target && schema ? [target, schema] : null;
}

/**
 * @param {unknown} value
 * @param {Schema} schema
 * @param {Lexicon} lexicon
 * @returns {unknown} undefined when the value has no place there
 */
function cap(value, schema, lexicon) {
	if (value === undefined || value === null) return undefined;
	switch (schema.type) {
		case 'ref': {
			const found = resolve(/** @type {string} */ (schema.ref), lexicon);
			return found ? cap(value, found[1], found[0]) : undefined;
		}
		case 'string': {
			if (typeof value !== 'string') return undefined;
			const max = schema.maxGraphemes ?? schema.maxLength ?? value.length;
			// Free text is cut; a code, a link or a date cut would mean something else: past its limits, it is left out.
			if (!schema.format && schema.minLength === undefined) return cutText(value, max);
			const fits = value.length >= (schema.minLength ?? 0) && value.length <= (schema.maxLength ?? FORMAT_MAX);
			return fits ? value : undefined;
		}
		case 'integer':
			return Number.isSafeInteger(value) ? value : undefined;
		case 'boolean':
			return typeof value === 'boolean' ? value : undefined;
		case 'array':
			if (!Array.isArray(value) || !schema.items) return undefined;
			return value
				.slice(0, schema.maxLength ?? value.length)
				.map((item) => cap(item, /** @type {Schema} */ (schema.items), lexicon))
				.filter((item) => item !== undefined);
		case 'record':
			return cap(value, /** @type {Schema} */ (schema.record), lexicon);
		case 'object': {
			if (typeof value !== 'object' || Array.isArray(value)) return undefined;
			const source = /** @type {Record<string, unknown>} */ (value);
			/** @type {Record<string, unknown>} */
			const kept = {};
			for (const [name, field] of Object.entries(schema.properties || {})) {
				const capped = cap(source[name], field, lexicon);
				if (capped !== undefined) kept[name] = capped;
			}
			return kept;
		}
		default:
			return undefined;
	}
}

/**
 * A record's value within its lexicon's limits (an empty object when it is not one).
 * @param {string} nsid the record's collection (today.joblist.company…)
 * @param {unknown} value
 * @returns {Record<string, any>}
 */
export function capRecord(nsid, value) {
	const lexicon = LEXICONS.get(nsid);
	if (!lexicon) throw new Error(`no lexicon for ${nsid}`);
	const kept = /** @type {Record<string, any> | undefined} */ (cap(value, lexicon.defs.main, lexicon));
	return kept ? { $type: nsid, ...kept } : {};
}
