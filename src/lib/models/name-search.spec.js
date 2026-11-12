import { describe, expect, it } from 'vitest';
import providers from '#lib/data/providers.json';
import config from '#lib/data/config.json';
import { boardIdsOf, foundOf, providerQuery, slugOf, socialsOf } from './name-search.js';

describe('a name', () => {
	it('as a slug, accents gone', () => {
		expect(slugOf('Médecins du Monde')).toBe('medecinsdumonde');
		expect(slugOf('Médecins du Monde', '-')).toBe('medecins-du-monde');
	});
	it('at a provider: its board, with no request', () => {
		expect(providerQuery('spacex greenhouse', providers)).toMatchObject({ id: 'spacex', url: 'https://job-boards.greenhouse.io/spacex' });
		expect(providerQuery('Lever at Acme Labs', providers)).toMatchObject({ id: 'acmelabs', provider: { id: 'lever' } });
		expect(providerQuery('spacex', providers)).toBeNull();
		expect(providerQuery('greenhouse', providers)).toBeNull();
	});
	it('may have a few board ids, the domain first', () => {
		expect(boardIdsOf('Médecins du Monde', 'medecinsdumonde.org')).toEqual(['medecinsdumonde', 'medecins-du-monde']);
		expect(boardIdsOf('SpaceX', 'spacex.com')).toEqual(['spacex']);
	});
});

describe('Wikidata', () => {
	const search = { search: [{ id: 'Q1' }, { id: 'Q2' }, { id: 'Q3' }] };
	const entities = {
		entities: {
			Q1: {
				labels: { fr: { value: 'Médecins du Monde' }, en: { value: 'Doctors of the World' } },
				descriptions: { en: { value: 'NGO' } },
				claims: {
					P856: [{ mainsnak: { datavalue: { value: 'https://www.medecinsdumonde.org/en/' } } }],
					P4033: [{ mainsnak: { datavalue: { value: 'mdm@mastodon.social' } } }],
					P2002: [{ mainsnak: { datavalue: { value: 'MdM_France' } } }]
				}
			},
			Q2: { labels: { en: { value: 'No website' } }, claims: {} },
			Q3: { labels: { en: { value: 'Bad' } }, claims: { P856: [{ mainsnak: { datavalue: { value: 'javascript:alert(1)' } } }] } }
		}
	};
	it('keeps organizations with a website, named in the language asked', () => {
		const found = foundOf(search, entities, 'fr', config.nameSearch.socials);
		expect(found).toHaveLength(1);
		expect(found[0]).toMatchObject({ id: 'Q1', name: 'Médecins du Monde', description: 'NGO', domain: 'medecinsdumonde.org' });
	});
	it('gives its social accounts as links', () => {
		expect(socialsOf(entities.entities.Q1.claims, config.nameSearch.socials).map((s) => s.href)).toEqual(['https://x.com/MdM_France', 'https://mastodon.social/@mdm']);
	});
	it('answers nothing for nothing', () => {
		expect(foundOf({}, {}, 'en', {})).toEqual([]);
	});
});
