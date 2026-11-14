import { describe, expect, it } from 'vitest';
import { match } from './directory.svelte.js';

/** @param {string} title @param {Record<string, any>} [extra] */
const job = (title, extra = {}) => ({ title, place: '', remote: '', employment: '', description: '', live: true, rkey: title, locations: [], ...extra });
/** @param {string} domain @param {Record<string, any>} company @param {any[]} [jobs] */
const org = (domain, company, jobs = []) => /** @type {any} */ ({ domain, did: `did:plc:${domain}`, avatar: '', value: null, company: { tags: [], locations: [], links: [], description: '', kind: '', url: '', ...company }, jobs });

describe('search', () => {
	const acme = org('acme.coop', { name: 'Acme Coop', tags: ['gardens'], locations: [{ name: 'Berlin', country: 'Germany' }] }, [job('Gardener', { place: 'Berlin' }), job('Old', { live: false })]);
	const zeta = org('zeta.org', { name: 'Zeta', description: 'Builds acme tools' }, [job('Rust engineer', { remote: 'remote' })]);

	it('finds organizations by what they say, their name first, and by their open jobs', () => {
		expect(match([zeta, acme], 'acme').organizations.map((p) => p.domain)).toEqual(['acme.coop', 'zeta.org']);
		expect(match([zeta, acme], 'berlin').organizations.map((p) => p.domain)).toEqual(['acme.coop']);
		expect(match([zeta, acme], 'rust').organizations.map((p) => p.domain)).toEqual(['zeta.org']);
	});

	it('finds open jobs by every word typed, their organization included; never closed ones', () => {
		expect(match([zeta, acme], 'gardener berlin').jobs.map((j) => j.job.title)).toEqual(['Gardener']);
		expect(match([zeta, acme], 'zeta remote').jobs.map((j) => j.job.title)).toEqual(['Rust engineer']);
		expect(match([zeta, acme], 'old').jobs).toEqual([]);
		expect(match([zeta, acme], '  ')).toEqual({ organizations: [], jobs: [] });
	});

	it('reads accents as their letters', () => {
		expect(match([org('cafe.fr', { name: 'Café Crème' })], 'creme').organizations).toHaveLength(1);
	});
});
