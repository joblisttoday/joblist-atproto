import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { readParams } from './paste.js';

const manifest = JSON.parse(readFileSync('static/manifest.webmanifest', 'utf8'));

/**
 * What the add page reads when the system share sheet opens it.
 * @param {Record<string, string>} shared
 */
function share(shared) {
	const { action, params } = manifest.share_target;
	const query = new URLSearchParams();
	for (const [field, name] of Object.entries(params)) if (shared[field]) query.set(String(name), shared[field]);
	return readParams(new URL(`${action}?${query}`, 'https://joblist.example').searchParams);
}

describe('share target', () => {
	it('opens the add page with GET', () => {
		expect(manifest.share_target).toMatchObject({ action: '/add', method: 'GET' });
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
