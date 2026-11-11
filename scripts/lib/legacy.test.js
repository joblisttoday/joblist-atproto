import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toKey, toRedirects } from './legacy.js';

describe('toKey', () => {
	it('keeps only characters valid in a record key', () => {
		assert.equal(toKey('charité berlin'), 'charite-berlin');
	});
});

describe('toRedirects', () => {
	it('sends each old company page to its new one', () => {
		assert.deepEqual(toRedirects([{ slug: 'ableton', rkey: 'ableton.com' }], []), ['/ableton /ableton.com 301']);
	});
	it('leaves the app routes alone', () => {
		assert.deepEqual(toRedirects([{ slug: 'jobs', rkey: 'jobs.com' }], ['jobs']), []);
	});
	it('encodes non-ASCII slugs', () => {
		assert.deepEqual(toRedirects([{ slug: 'charité', rkey: 'charite.de' }], []), ['/charit%C3%A9 /charite.de 301']);
	});
});
