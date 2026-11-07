/**
 * Forms kept in this browser until they are saved (drafts), and the way back
 * to saving them after signing in.
 */

/**
 * A kept draft over the empty form, field by field: a field of another type is left empty.
 * @template {Record<string, any>} T
 * @param {T} empty
 * @param {unknown} draft
 * @returns {T | null}
 */
export function overEmpty(empty, draft) {
	if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return null;
	/** @type {Record<string, any>} */
	const form = { ...empty };
	/** @type {Record<string, any>} */
	const kept = draft;
	for (const [field, value] of Object.entries(empty)) {
		if (typeof kept[field] === typeof value && Array.isArray(kept[field]) === Array.isArray(value)) form[field] = kept[field];
	}
	return /** @type {T} */ (form);
}

/**
 * Whether the person left this form to sign in (pressing save), recently enough
 * that coming back to it is that same moment.
 * @param {unknown} kept what was kept when they left: {form, at}
 * @param {string} form which form: job, company, list
 * @param {number} now
 * @param {number} maxMs
 */
export function returningToSave(kept, form, now, maxMs) {
	if (!kept || typeof kept !== 'object') return false;
	const { form: name, at } = /** @type {Record<string, unknown>} */ (kept);
	return name === form && typeof at === 'number' && now - at >= 0 && now - at <= maxMs;
}
