import { describe, expect, it } from 'vitest';
import { readPage } from './page-read.js';

/** @param {Partial<import('./page-read.js').Collected>} page */
const collected = (page) => ({ url: 'https://www.acme.coop/about', title: '', metas: {}, links: [], ...page });

describe('readPage', () => {
	it('reads an organization from its website: name, description, board, its own social profiles', () => {
		const read = readPage(
			collected({
				title: 'About us | Acme Coop',
				metas: { description: 'A worker-owned design studio.' },
				links: [
					'https://boards.greenhouse.io/acme/jobs/1',
					'https://jobs.lever.co/other',
					'https://boards.greenhouse.io/acme',
					'https://bsky.app/profile/acme.coop',
					'https://twitter.com/intent/tweet?text=hi',
					'https://www.facebook.com/sharer/sharer.php?u=x',
					'https://www.instagram.com/acme.coop/',
					'https://www.linkedin.com/company/acme-coop/about',
					'https://github.com/acme-coop/website',
					'https://bsky.app/profile/someone-else'
				]
			})
		);
		expect(read).toEqual({
			link: 'https://www.acme.coop',
			key: 'acme.coop',
			name: 'Acme Coop',
			description: 'A worker-owned design studio.',
			boards: [
				{ provider: 'greenhouse', id: 'acme', url: 'https://job-boards.greenhouse.io/acme' },
				{ provider: 'lever', id: 'other', url: 'https://jobs.lever.co/other' }
			],
			socials: [
				{ id: 'bluesky', name: 'Bluesky', url: 'https://bsky.app/profile/acme.coop' },
				{ id: 'instagram', name: 'Instagram', url: 'https://instagram.com/acme.coop' },
				{ id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/company/acme-coop' },
				{ id: 'github', name: 'GitHub', url: 'https://github.com/acme-coop' }
			]
		});
	});
	it("prefers the site's own name, else names it from its domain", () => {
		expect(readPage(collected({ title: 'Home', metas: { 'og:site_name': 'ACME' } }))?.name).toBe('ACME');
		expect(readPage(collected({ title: 'Welcome to our site' }))?.name).toBe('Acme');
		expect(readPage(collected({ title: 'Acme: The design studio for modern coops' }))?.name).toBe('Acme');
	});
	it('reads a board page as one, and keeps a platform page as it is', () => {
		expect(readPage(collected({ url: 'https://jobs.ashbyhq.com/posthog' }))?.boards).toEqual([{ provider: 'ashby', id: 'posthog', url: 'https://jobs.ashbyhq.com/posthog' }]);
		const group = readPage(collected({ url: 'https://www.facebook.com/groups/somecoop/' }));
		expect(group?.link).toBe('https://www.facebook.com/groups/somecoop/');
		expect(group?.key).toBe('');
	});
	it('reads nothing of a page not on the web', () => {
		expect(readPage(collected({ url: 'about:blank' }))).toBeNull();
		expect(readPage(collected({ url: 'moz-extension://x/popup.html' }))).toBeNull();
	});
});
