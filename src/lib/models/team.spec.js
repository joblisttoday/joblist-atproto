import { describe, expect, it } from 'vitest';
import { teamOf, teamsOf } from './team.js';

/** @param {Partial<import('#lib/ats/job.js').Job>} job */
const job = (job) => /** @type {import('#lib/ats/job.js').Job} */ ({ title: 'Job', url: Math.random().toString(), company: 'a', ...job });

describe('teams', () => {
	it('are the departments a board gives, else the field of the title, the largest first', () => {
		const jobs = [
			job({ title: 'Office plant', department: '' }),
			job({ title: 'Backend', department: 'Platform' }),
			job({ title: 'Frontend developer' }),
			job({ title: 'SRE', department: ' Platform ' }),
			job({ title: 'Account executive', department: 'Sales' })
		];
		expect(teamOf(jobs[2])).toBe('field:engineering');
		expect(teamOf(jobs[0])).toBe('');
		expect(teamsOf(jobs)).toEqual([
			{ id: 'Platform', count: 2 },
			{ id: 'field:engineering', count: 1 },
			{ id: 'Sales', count: 1 }
		]);
	});
});
