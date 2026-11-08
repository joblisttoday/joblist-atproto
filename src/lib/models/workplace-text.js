import phrases from '#lib/data/workplace-phrases.json' with { type: 'json' };

/**
 * Where a job is done, as its description says it, for job boards that do not say
 * it themselves (src/lib/data/workplace-phrases.json). Only clear phrases count:
 * a wrong "remote" is worse than "not said", so anything else is undefined.
 * @typedef {'remote' | 'hybrid' | 'onsite'} Workplace
 */

const rules = phrases.rules.map(({ workplace, phrase }) => ({
	workplace: /** @type {Workplace} */ (workplace),
	// Word boundaries that also hold around "#" and accented letters.
	pattern: new RegExp(`(?<![\\p{L}\\p{N}])(${phrase})(?![\\p{L}\\p{N}])`, 'iu')
}));

/**
 * @param {string | undefined} text a job's description, as plain text
 * @returns {Workplace | undefined}
 */
export function workplaceFromText(text) {
	if (!text) return undefined;
	return rules.find((rule) => rule.pattern.test(text))?.workplace;
}
