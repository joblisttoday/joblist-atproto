import config from '#lib/data/config.json';
import { overEmpty, returningToSave } from '#lib/models/form-draft.js';
import { scoped } from '#lib/profiles/profiles.js';

/**
 * What is being written in a form, kept in this browser until it is saved: a reload,
 * or signing in on the way (which leaves the page), does not lose it. Drafts stay
 * in this browser, and signing out clears them for the next person.
 */
const DRAFTS = {
	job: scoped('joblist.jobDraft.v1'),
	company: scoped('joblist.companyDraft.v1'),
	list: scoped('joblist.listDraft.v1')
};
/** Left a form to sign in and save it (this tab only). */
const RETURN = 'joblist.saveAfterSignIn.v1';

/** @typedef {keyof typeof DRAFTS} FormName */

/**
 * @template {Record<string, any>} T
 * @param {FormName} name
 * @param {T} empty
 * @returns {T | null}
 */
export function readKept(name, empty) {
	try {
		return overEmpty(empty, JSON.parse(localStorage.getItem(DRAFTS[name]) || 'null'));
	} catch {
		return null;
	}
}

/**
 * @param {FormName} name
 * @param {Record<string, any>} form
 */
export function keep(name, form) {
	try {
		localStorage.setItem(DRAFTS[name], JSON.stringify(form));
	} catch {
		// storage full or blocked: the draft lasts until the page closes
	}
}

/** @param {FormName} name */
export function forget(name) {
	try {
		localStorage.removeItem(DRAFTS[name]);
	} catch {
		// nothing kept
	}
}

/** Signing out: nothing written here stays for whoever uses this browser next. */
export function forgetAll() {
	for (const name of /** @type {FormName[]} */ (Object.keys(DRAFTS))) forget(name);
	leftToSave(null);
}

/**
 * Leaving this form to sign in and save it; null when that is over (saved, or not signing in after all).
 * @param {FormName | null} name
 */
export function leftToSave(name) {
	try {
		if (name) sessionStorage.setItem(RETURN, JSON.stringify({ form: name, at: Date.now() }));
		else sessionStorage.removeItem(RETURN);
	} catch {
		// storage blocked: the form is there, without the reminder to save it
	}
}

/**
 * Back on this form from signing in to save it.
 * @param {FormName} name
 */
export function backToSave(name) {
	try {
		const kept = JSON.parse(sessionStorage.getItem(RETURN) || 'null');
		return returningToSave(kept, name, Date.now(), config.saveSignIn.returnMinutes * 60_000);
	} catch {
		return false;
	}
}
