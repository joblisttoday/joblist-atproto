import { describe, expect, it } from 'vitest';
import { byTeam } from './team.js';

/** @param {Partial<import('#lib/ats/job.js').Job>} job */
const job = (job) => /** @type {import('#lib/ats/job.js').Job} */ ({ title: 'Job', url: Math.random().toString(), company: 'a', ...job });

describe('byTeam', () => {
	it('groups by department, else by the field of the title, the largest first (ties as they came) and no team last', () => {
		const groups = byTeam(
			[
				job({ title: 'Office plant', department: '' }),
				job({ title: 'Backend', department: 'Platform' }),
				job({ title: 'Frontend developer' }),
				job({ title: 'SRE', department: ' Platform ' }),
				job({ title: 'Account executive', department: 'Sales' })
			],
			(field) => `field:${field}`
		);
		expect(groups.map(([team, list]) => [team, list.length])).toEqual([
			['Platform', 2],
			['field:engineering', 1],
			['Sales', 1],
			['', 1]
		]);
	});
});
