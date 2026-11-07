import config from '#lib/data/config.json' with { type: 'json' };
import places from '#lib/data/places.json' with { type: 'json' };
import { canonical, expandStates } from './place.js';

/**
 * The places a job location names, as people would pick them: "Remote - USA" names
 * the United States, "Hybrid" or "Remote job" none (they say how, not where), and
 * "San Francisco, CA" names San Francisco and California.
 */

/** @param {string} text */
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Words saying how the work is done, or around such words ("Remote first", "US only").
const workList = [...config.jobs.remoteWords, ...config.jobs.hybridWords, ...config.jobs.onsiteWords, ...places.remoteNoise];
const workWords = workList
	.sort((a, b) => b.length - a.length)
	.map(escape)
	.join('|');
const gap = '[\\s\\[\\]\\-–—:·•*]';
const word = `\\(?\\s*(?:${workWords})\\s*\\)?`;
const leading = new RegExp(`^(?:${gap}+|${word}(?=${gap}|[()]|$))`, 'iu');
const trailing = new RegExp(`(?:(?<=${gap}|[()])${word}|${gap}+)$`, 'iu');
// Only the end of a text is looked at for a trailing word: far faster than the whole of it.
const tailLength = Math.max(...workList.map((w) => w.length)) + 8;
const wrapped = /^\(([^()]*)\)$/;

/** @param {string} text */
function withoutTrailing(text) {
	const start = Math.max(0, text.length - tailLength);
	const found = trailing.exec(text.slice(start));
	return found ? text.slice(0, start + found.index) : text;
}

/**
 * A part of a location without the work-place words around it, nor brackets left
 * empty or cut by a comma: "Remote - USA" → "USA", "Paris (On-site)" → "Paris",
 * "Remote (United States" → "United States".
 * @param {string} part
 */
export function bare(part) {
	let text = part.trim();
	for (let before = ''; before !== text; ) {
		before = text;
		text = withoutTrailing(text.replace(leading, '')).replace(/\(\s*\)/g, '').replace(wrapped, '$1');
		if (!text.includes(')')) text = text.replace(/^\(/, '');
		if (!text.includes('(')) text = text.replace(/\)$/, '');
	}
	return text;
}

/** @type {Map<string, {key: string, name: string}[]>} */
const named = new Map();
/** @type {Map<string, string>} */
const keys = new Map();

/** @param {string} name */
function keyOf(name) {
	let key = keys.get(name);
	if (key === undefined) {
		key = canonical(name).trim();
		keys.set(name, key);
	}
	return key;
}

/**
 * The places named in a location, each with what makes two spellings the same place
 * (key: "united states" for "USA" and "United States").
 * @param {string | undefined} location
 */
export function placeParts(location) {
	const text = location || '';
	let parts = named.get(text);
	if (!parts) {
		parts = [];
		for (const part of expandStates(text).split(/[,;/|•]/)) {
			const name = bare(part);
			const key = name.length > 1 ? keyOf(name) : '';
			if (key) parts.push({ key, name });
		}
		named.set(text, parts);
	}
	return parts;
}
