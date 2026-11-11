import { page } from '$app/state';
import { pushState, replaceState } from '$app/navigation';
import config from '#lib/data/config.json';
import { readAddress } from './address.js';
import { session } from '#lib/auth/session.svelte.js';

/**
 * A job read in a dialog over the page it was tapped in (JobsDialog.svelte): a history entry
 * (shallow routing), so back and the phone's back gesture close it like a page, and its link in
 * the address (#job=…), so it can be shared. The same on every page that lists jobs.
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

const PARAM = config.jobs.jobParam;

/** The job open, or null. @returns {Job | null} */
export const openJob = () => page.state.job ?? null;

/** The address with a job open in it, or none (the page's other state kept). @param {string} [url] */
function withJob(url) {
	const hash = new URLSearchParams(location.hash.slice(1));
	if (url) hash.set(PARAM, url);
	else hash.delete(PARAM);
	const text = hash.toString();
	return `${location.pathname}${location.search}${text ? `#${text}` : ''}`;
}

/** Opens a job over the page (another one open: in its place, one step further). @param {Job} job */
export function showJob(job) {
	pushState(withJob(job.url), { ...page.state, job: $state.snapshot(job), linked: undefined });
}

/** Closes it: one step back, or, opened from a link to it, the page without it (not the site before). */
export function closeJob() {
	if (page.state.linked) replaceState(withJob(), {});
	else history.back();
}

/**
 * Opened from a link to a job (#job=…): opens it once the page's jobs are read.
 * Call it while the page's component starts.
 * @param {() => {jobs: Job[], done: boolean}} read the page's jobs, and whether all are read
 */
export function followJobLink(read) {
	let linked = readAddress([PARAM]).get(PARAM);
	$effect(() => {
		// Once a sign-in's answer has left the address.
		if (!linked || !session.ready) return;
		const { jobs, done } = read();
		const job = jobs.find((j) => j.url === linked);
		if (!job && !done) return;
		linked = null;
		if (job) replaceState(location.href, { job: $state.snapshot(job), linked: true });
	});
}
