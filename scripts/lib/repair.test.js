import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isMove } from './repair.js';

describe('isMove', () => {
	it('takes a new domain', () => {
		assert.equal(isMove('https://notion.so', 'notion.com'), true);
		assert.equal(isMove('https://www.acme.de', 'acme.com'), true);
		assert.equal(isMove('https://flyzipline.com', 'zipline.com'), true);
	});
	it('not a country version of the same site, which depends on the visitor', () => {
		assert.equal(isMove('https://veepee.com', 'veepee.fr'), false);
		assert.equal(isMove('https://misterspex.com', 'misterspex.de'), false);
	});
	it('not a page on a subdomain', () => {
		assert.equal(isMove('https://eurosky.social', 'portal.eurosky.tech'), false);
	});
});
