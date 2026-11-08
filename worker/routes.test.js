import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileOf, pathOf, route, withPage } from './routes.js';

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
	const list = { kind: 'feed', list: { did: 'did:plc:abc123', rkey: '3my7yphuxc72y' } };
	assert.deepEqual(route('/feed/list/did:plc:abc123/3my7yphuxc72y.xml'), list);
	assert.equal(fileOf(list), 'lists/plc/abc123/3my7yphuxc72y.json');
	assert.equal(pathOf(list), '/feed/list/did:plc:abc123/3my7yphuxc72y.xml');
});

test('the feed of any search, kept as the explorer writes it', () => {
	const search = route('/feed/search.xml');
	assert.ok(search);
	const found = withPage(search, new URLSearchParams('where=Lisbon&q=design&remote=nonsense&near=1,2&utm=x'));
	assert.deepEqual(found, { kind: 'feed', search: '?q=design&where=Lisbon' });
	assert.equal(pathOf(found), '/feed/search.xml?q=design&where=Lisbon');
	assert.equal(fileOf(found), 'landing/recent.json');
	assert.deepEqual(withPage(search, new URLSearchParams('')), { kind: 'redirect', location: '/feed/new.xml' });
	assert.deepEqual(withPage(search, new URLSearchParams('q=legal&company=acme.org')), { kind: 'feed', search: '?q=legal&company=acme.org' });
	assert.deepEqual(withPage(search, new URLSearchParams('company=acme.org')), { kind: 'redirect', location: '/feed/company/acme.org.xml' });
	assert.deepEqual(withPage(search, new URLSearchParams('q=x&company=../etc')), { kind: 'redirect', location: '/feed/new.xml' });
	const long = withPage(search, new URLSearchParams(`q=${'a'.repeat(5000)}`));
	assert.ok(long.kind === 'feed' && (long.search || '').length < 200, 'a long search is cut');
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
		'/feed/list/did:plc:abc/..%2F..%2Fx.xml',
		'/feed/list/did:plc:abc/...xml',
		'/feed/list/notadid/3my7.xml',
		'/feed/list/did:plc:abc.xml',
		'/feed/list/did:plc:abc/3my7/more.xml',
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

test('pages of older jobs', () => {
	const berlin = /** @type {import('./routes.js').Route} */ ({ kind: 'page', city: 'berlin' });
	const second = withPage(berlin, new URLSearchParams('page=2'));
	assert.deepEqual(second, { kind: 'page', city: 'berlin', page: 2 });
	assert.equal(pathOf(second), '/in/berlin?page=2');
	assert.equal(fileOf(second), 'landing/in/berlin.2.json');
	assert.deepEqual(withPage(berlin, new URLSearchParams('utm=x')), berlin);
	for (const q of ['page=1', 'page=x', 'page=0'])
		assert.deepEqual(withPage(berlin, new URLSearchParams(q)), { kind: 'redirect', location: '/in/berlin' }, q);
	assert.deepEqual(withPage({ kind: 'cities' }, new URLSearchParams('page=2')), { kind: 'cities' });
});

test('each route has its path and snapshot file', () => {
	assert.equal(pathOf({ kind: 'feed', city: 'berlin', field: 'design' }), '/feed/in/berlin/design.xml');
	assert.equal(fileOf({ kind: 'page', city: 'berlin', field: 'design' }), 'landing/in/berlin/design.json');
	assert.equal(fileOf({ kind: 'feed' }), 'landing/new.json');
	assert.equal(fileOf({ kind: 'feed', company: 'acme.org' }), 'companies/acme.org.json');
	assert.equal(fileOf({ kind: 'sitemap' }), 'landing/index.json');
});
