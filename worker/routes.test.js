import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileOf, pathOf, route } from './routes.js';

test('pages per city and field', () => {
	assert.deepEqual(route('/in'), { kind: 'cities' });
	assert.deepEqual(route('/field'), { kind: 'fields' });
	assert.deepEqual(route('/in/berlin'), { kind: 'page', city: 'berlin' });
	assert.deepEqual(route('/in/berlin/design'), { kind: 'page', city: 'berlin', field: 'design' });
	assert.deepEqual(route('/field/design'), { kind: 'page', field: 'design' });
	assert.deepEqual(route('/sitemap-places.xml'), { kind: 'sitemap' });
});

test('feeds', () => {
	assert.deepEqual(route('/feed/new.xml'), { kind: 'feed' });
	assert.deepEqual(route('/feed/in/berlin.xml'), { kind: 'feed', city: 'berlin' });
	assert.deepEqual(route('/feed/in/berlin/design.xml'), { kind: 'feed', city: 'berlin', field: 'design' });
	assert.deepEqual(route('/feed/field/design.xml'), { kind: 'feed', field: 'design' });
	assert.deepEqual(route('/feed/company/acme.org.xml'), { kind: 'feed', company: 'acme.org' });
});

test('anything else is not ours', () => {
	for (const path of [
		'/',
		'/inside',
		'/in/s%C3%A3o-paulo',
		'/in/berlin/nonsense',
		'/in/berlin/design/more',
		'/in/../etc',
		'/field/unknown',
		'/field/design/berlin',
		'/feed/new',
		'/feed/in.xml',
		'/feed/in/berlin.json',
		'/feed/company/..%2Fx.xml',
		'/feed/company/a/b.xml',
		'/feed/field/unknown.xml',
		'//evil.example/',
		'/in//',
		'/In/Nonsense/Path',
		'/In/s%C3%A3o-paulo',
		'/Company/X'
	])
		assert.equal(route(path), null, path);
});

test('a trailing slash leads to the page, never elsewhere', () => {
	assert.deepEqual(route('/in/berlin/'), { kind: 'redirect', location: '/in/berlin' });
	assert.deepEqual(route('/field/'), { kind: 'redirect', location: '/field' });
	assert.equal(route('//evil.example/in/'), null);
});

test('capitals lead to the page in small letters', () => {
	assert.deepEqual(route('/in/Berlin'), { kind: 'redirect', location: '/in/berlin' });
	assert.deepEqual(route('/IN/Berlin/Design/'), { kind: 'redirect', location: '/in/berlin/design' });
	assert.deepEqual(route('/Field/Design'), { kind: 'redirect', location: '/field/design' });
	assert.deepEqual(route('/feed/in/Berlin.xml'), { kind: 'redirect', location: '/feed/in/berlin.xml' });
});

test('each route has its path and snapshot file', () => {
	assert.equal(pathOf({ kind: 'feed', city: 'berlin', field: 'design' }), '/feed/in/berlin/design.xml');
	assert.equal(fileOf({ kind: 'page', city: 'berlin', field: 'design' }), 'landing/in/berlin/design.json');
	assert.equal(fileOf({ kind: 'feed' }), 'landing/new.json');
	assert.equal(fileOf({ kind: 'feed', company: 'acme.org' }), 'companies/acme.org.json');
	assert.equal(fileOf({ kind: 'sitemap' }), 'landing/index.json');
});
