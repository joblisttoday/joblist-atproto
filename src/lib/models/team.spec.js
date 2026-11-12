import { describe, expect, it } from 'vitest';
import { departmentsByJob } from '#lib/ats/greenhouse.js';
import { teamKey, teamOf, teamsOf } from './team.js';

/** @param {Partial<import('#lib/ats/job.js').Job>} job */
const job = (job) => /** @type {import('#lib/ats/job.js').Job} */ ({ title: 'Job', url: Math.random().toString(), company: 'a', ...job });

describe('teams', () => {
	it('are the departments the boards give, one name in any case, the largest first', () => {
		const jobs = [
			job({ title: 'Office plant', department: '' }),
			job({ title: 'Backend', department: 'Platform', company: 'a' }),
			job({ title: 'Frontend developer' }),
			job({ title: 'SRE', department: ' platform ', company: 'b' }),
			job({ title: 'Account executive', department: 'Sales' })
		];
		expect(teamOf(jobs[2])).toBe('');
		expect(teamOf(jobs[3])).toBe('platform');
		expect(teamsOf(jobs)).toEqual([
			{ id: 'platform', label: 'Platform', count: 2 },
			{ id: 'sales', label: 'Sales', count: 1 }
		]);
	});
	it('have a key: lowercase, spaces made one', () => {
		expect(teamKey('  Starlink   Network Engineering ')).toBe('starlink network engineering');
		expect(teamKey(undefined)).toBe('');
	});
});

describe('Greenhouse departments', () => {
	it('give each job its own one', () => {
		const data = { departments: [{ name: 'No Department', jobs: [{ id: 3 }] }, { name: 'AI Engineering', jobs: [{ id: 1 }, { id: 2 }] }, { name: 'Sales', jobs: [] }] };
		expect([...departmentsByJob(data)]).toEqual([
			['1', 'AI Engineering'],
			['2', 'AI Engineering']
		]);
		expect(departmentsByJob(null).size).toBe(0);
	});
});
