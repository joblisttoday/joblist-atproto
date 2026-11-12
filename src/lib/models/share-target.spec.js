import { describe, expect, it } from 'vitest';
import manifestText from '../../../static/manifest.webmanifest?raw';
import { readParams } from './paste.js';

const manifest = JSON.parse(manifestText);

/**
 * What the organization page reads when the system share sheet opens it.
 * @param {Record<string, string>} shared
 */
function share(shared) {
	const { action, params } = manifest.share_target;
	const query = new URLSearchParams();
	for (const [field, name] of Object.entries(params)) if (shared[field]) query.set(String(name), shared[field]);
	return readParams(new URL(`${action}?${query}`, 'https://joblist.example').searchParams);
}

describe('share target', () => {
	it('opens the organization shared, with GET', () => {
		expect(manifest.share_target).toMatchObject({ action: '/me/organization', method: 'GET' });
	});
	it('takes the shared url', () => {
		expect(share({ title: 'Careers | Acme', url: 'https://acme.org/careers' }).link).toBe('https://acme.org/careers');
	});
	it('finds the link in the text when apps put it there', () => {
		expect(share({ title: 'Senior dev', text: 'Senior dev at Acme\nhttps://jobs.lever.co/acme/42' }).link).toBe(
			'https://jobs.lever.co/acme/42'
		);
		expect(share({ text: 'https://boards.greenhouse.io/acme/jobs/1 via LinkedIn' }).link).toBe(
			'https://boards.greenhouse.io/acme/jobs/1'
		);
	});
});
