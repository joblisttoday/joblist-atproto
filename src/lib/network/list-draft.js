import { forget, keep, readKept } from './drafts.js';

/**
 * The list being made, kept in this browser until it is saved. Edits of a list
 * start from the list as it is, and are not kept.
 * @typedef {import('#lib/models/list-form.js').ListForm} ListForm
 */

/** @param {ListForm} empty */
export const readListDraft = (empty) => readKept('list', empty);

/** @param {ListForm} form */
export const writeListDraft = (form) => keep('list', form);

export const clearListDraft = () => forget('list');
