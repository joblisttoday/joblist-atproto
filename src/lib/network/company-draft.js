import { forget, keep, readKept } from './drafts.js';

/**
 * The company being added, kept in this browser until it is saved. Edits of a
 * company already on joblist start from the version shown, and are not kept.
 * @typedef {import('#lib/models/company.js').CompanyForm} CompanyForm
 */

/**
 * The draft over the empty form, field by field (a field of another type is left empty).
 * @param {CompanyForm} empty
 * @returns {CompanyForm | null}
 */
export const readCompanyDraft = (empty) => readKept('company', empty);

/** @param {CompanyForm} form */
export const writeCompanyDraft = (form) => keep('company', form);

export const clearCompanyDraft = () => forget('company');
