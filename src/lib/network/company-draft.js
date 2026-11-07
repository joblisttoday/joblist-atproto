/**
 * The company being added, kept in this browser until it is saved: a reload,
 * or signing in on the way, does not lose it. Edits of a company already on
 * joblist start from the version shown, and are not kept.
 * @typedef {import('#lib/models/company.js').CompanyForm} CompanyForm
 */

const KEY = 'joblist.companyDraft.v1';

/**
 * The draft over the empty form, field by field (a field of another type is left empty).
 * @param {CompanyForm} empty
 * @returns {CompanyForm | null}
 */
export function readCompanyDraft(empty) {
	try {
		const draft = JSON.parse(localStorage.getItem(KEY) || 'null');
		if (!draft || typeof draft !== 'object') return null;
		/** @type {Record<string, any>} */
		const form = { ...empty };
		for (const [field, value] of Object.entries(empty)) {
			if (typeof draft[field] === typeof value && Array.isArray(draft[field]) === Array.isArray(value)) form[field] = draft[field];
		}
		return /** @type {CompanyForm} */ (form);
	} catch {
		return null;
	}
}

/** @param {CompanyForm} form */
export function writeCompanyDraft(form) {
	try {
		localStorage.setItem(KEY, JSON.stringify(form));
	} catch {
		// storage full or blocked: the draft lasts until the page closes
	}
}

export function clearCompanyDraft() {
	try {
		localStorage.removeItem(KEY);
	} catch {
		// nothing kept
	}
}
