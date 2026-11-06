import { describe, expect, it } from 'vitest';
import { markKey, marked, withoutHidden } from './job-mark.js';

/** @param {string} title @param {Partial<import('#lib/ats/job.js').Job>} [extra] @returns {import('#lib/ats/job.js').Job} */
const job = (title, extra = {}) => ({ title, url: `https://jobs.example/${title}`, company: 'acme', ...extra });

describe('job marks', () => {
	it('marks a board offer at all its places, a posted offer by its address', () => {
		expect(markKey(job('Designer'))).toBe(markKey(job('designer ', { url: 'https://jobs.example/other' })));
		expect(markKey(job('Designer', { posted: { did: 'did:plc:a', rkey: '1', verified: true } }))).toBe('https://jobs.example/Designer');
	});
	it('leaves the hidden offers out', () => {
		const jobs = [job('Designer'), job('Engineer')];
		/** @type {Record<string, import('./job-mark.js').JobMark>} */
		const marks = { [markKey(jobs[0])]: { mark: 'hidden', at: '2026-01-01', title: 'Designer', company: 'acme', url: '' } };
		expect(withoutHidden(jobs, marks).map((j) => j.title)).toEqual(['Engineer']);
		expect(withoutHidden(jobs, {})).toBe(jobs);
	});
	it('lists one kind, latest first', () => {
		/** @param {import('./job-mark.js').Mark} mark @param {string} at */
		const m = (mark, at) => ({ mark, at, title: at, company: 'acme', url: '' });
		const marks = { a: m('applied', '2026-01-01'), b: m('hidden', '2026-01-03'), c: m('applied', '2026-01-02') };
		expect(marked(marks, 'applied').map(([key]) => key)).toEqual(['c', 'a']);
	});
});
