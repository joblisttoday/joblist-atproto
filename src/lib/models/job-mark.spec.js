import { describe, expect, it } from 'vitest';
import { markKey, withoutHidden } from './job-mark.js';

/** @param {string} title @param {Partial<import('#lib/ats/job.js').Job>} [extra] @returns {import('#lib/ats/job.js').Job} */
const job = (title, extra = {}) => ({ title, url: `https://jobs.example/${title}`, company: 'acme', ...extra });

describe('job marks', () => {
	it('marks a board offer at all its places, a posted offer by its address', () => {
		expect(markKey(job('Designer'))).toBe(markKey(job('designer ', { url: 'https://jobs.example/other' })));
		expect(markKey(job('Designer', { posted: { did: 'did:plc:a', rkey: '1', verified: true } }))).toBe('https://jobs.example/Designer');
	});
	it('leaves the hidden offers out', () => {
		const jobs = [job('Designer'), job('Engineer')];
		const hidden = { [markKey(jobs[0])]: { at: '2026-01-01', title: 'Designer', company: 'acme', url: '' } };
		expect(withoutHidden(jobs, hidden).map((j) => j.title)).toEqual(['Engineer']);
		expect(withoutHidden(jobs, {})).toBe(jobs);
	});
});
