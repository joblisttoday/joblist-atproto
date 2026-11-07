import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atom, xml } from './feed.js';
import { headers, pagePolicy } from './http.js';
import { indexMeta, landingMeta } from './pages.js';
import { placePaths, render } from './render.js';
import { isoDate } from './text.js';

const template = `<!doctype html><html><head><meta http-equiv="content-security-policy" content="script-src 'self'"><title>x</title></head><body><div></div></body></html>`;
const evil = {
	generatedAt: '2026-11-07T01:00Z',
	name: 'Berlin<script>',
	count: 2,
	names: { 'acme.org': 'Acme</noscript><script>alert(1)</script>' },
	jobs: [
		{ t: 'Designer <img src=x onerror=alert(1)>\u0001', u: 'https://a.example/1?x=1&y="2"', c: 'acme.org', l: 'Berlin', p: '2026-11-02T17:49Z', r: 'remote' },
		{ t: 'Script link', u: 'javascript:alert(1)', c: 'acme.org', p: '2026-11-01T10:00Z' },
		{ t: 'Old', u: 'https://a.example/2', c: '../x', p: 'not a date' }
	],
	fields: [{ slug: 'design', count: 12 }, { slug: '"><script>', count: 1 }]
};

test('dates with seconds, as Atom wants', () => {
	assert.equal(isoDate('2026-11-02T17:49Z'), '2026-11-02T17:49:00Z');
	assert.equal(isoDate('2026-11-02T17:49:12.345Z'), '2026-11-02T17:49:12Z');
	assert.equal(isoDate('nope'), '');
	assert.equal(isoDate(undefined), '');
});

test('a page escapes what the jobs say and drops links that are not web links', () => {
	const meta = landingMeta({ city: 'berlin' }, evil);
	assert.equal(meta.title, 'Jobs in Berlin<script> · joblist');
	assert.equal(meta.url, 'https://joblist.today/in/berlin');
	assert.match(meta.head || '', /rel="alternate" type="application\/atom\+xml" title="Jobs in Berlin&lt;script&gt;" href="https:\/\/joblist\.today\/feed\/in\/berlin\.xml"/);
	assert.doesNotMatch(meta.body, /<script|<img|javascript:/);
	assert.match(meta.body, /Designer &lt;img/);
	assert.match(meta.body, /href="https:\/\/a\.example\/1\?x=1&amp;y=&quot;2&quot;"/);
	assert.match(meta.body, /href="\/\?where=Berlin%3Cscript%3E"/);
	// The company with an odd key is named, not linked.
	assert.doesNotMatch(meta.body, /\/company\/\.\.\/x/);
	// A field the file names is linked only when its address is a plain one.
	assert.match(meta.body, /<a href="\/in\/berlin\/design">Design jobs in Berlin&lt;script&gt;<\/a>/);
	assert.doesNotMatch(meta.body, /in\/berlin\/"/);
	const html = render({ kind: 'page', city: 'berlin' }, evil, template).body;
	assert.equal((html.match(/<script/g) || []).length, 1, 'only the JSON-LD script');
	assert.match(html, /application\/ld\+json/);
	assert.doesNotMatch(html.slice(html.indexOf('ld+json')), /<\/script>.*<\/script>/s);
});

test('pages of older jobs link to each other and are their own canonical', () => {
	const first = landingMeta({ city: 'berlin' }, { ...evil, pages: 3, page: 1 });
	assert.match(first.head || '', /<link rel="next" href="https:\/\/joblist\.today\/in\/berlin\?page=2">/);
	assert.doesNotMatch(first.head || '', /rel="prev"/);
	assert.match(first.body, /<a href="\/in\/berlin\?page=2" rel="next">Older jobs<\/a>/);
	const second = landingMeta({ city: 'berlin', page: 2 }, { ...evil, pages: 3, page: 2 });
	assert.equal(second.url, 'https://joblist.today/in/berlin?page=2');
	assert.equal(second.title, 'Jobs in Berlin<script> · Page 2 of 3 · joblist');
	assert.match(second.head || '', /<link rel="prev" href="https:\/\/joblist\.today\/in\/berlin">/);
	assert.match(second.head || '', /<link rel="next" href="https:\/\/joblist\.today\/in\/berlin\?page=3">/);
	assert.match(second.body, /<ol start="51">/);
	const html = render({ kind: 'page', city: 'berlin', page: 2 }, { ...evil, pages: 2 }, template).body;
	assert.match(html, /<link rel="canonical" href="https:\/\/joblist\.today\/in\/berlin\?page=2">/);
	assert.doesNotMatch(html, /rel="next"/);
	// One page only: no links between pages.
	assert.doesNotMatch(landingMeta({ city: 'berlin' }, evil).body, /Older jobs/);
});

test('the indexes list cities and fields', () => {
	const index = { cities: [{ slug: 'berlin', name: 'Berlin', count: 500, fields: ['design', 'nope'] }, { slug: '../x', name: 'X', count: 1 }], fields: [{ slug: 'design', count: 40 }, { slug: 'nope', count: 3 }] };
	assert.match(indexMeta('cities', index).body, /<a href="\/in\/berlin">Berlin<\/a> \(500 open jobs\)/);
	assert.doesNotMatch(indexMeta('cities', index).body, /\.\.\/x/);
	assert.match(indexMeta('fields', index).body, /<a href="\/field\/design">Design<\/a>/);
	assert.deepEqual(
		placePaths(index).map((p) => p.path),
		['/in', '/field', '/in/berlin', '/field/design', '/in/berlin/design']
	);
	const datedIndex = { cities: [{ ...index.cities[0], updated: '2026-11-02T17:49Z' }], fields: [{ slug: 'design', updated: '2026-11-01T00:00Z' }] };
	const dated = placePaths(datedIndex);
	assert.deepEqual(dated.slice(0, 3), [
		{ path: '/in', updated: '2026-11-02T17:49Z' },
		{ path: '/field', updated: '2026-11-02T17:49Z' },
		{ path: '/in/berlin', updated: '2026-11-02T17:49Z' }
	]);
	assert.match(render({ kind: 'sitemap' }, datedIndex, '').body, /<loc>https:\/\/joblist\.today\/in\/berlin<\/loc><lastmod>2026-11-02T17:49:00Z<\/lastmod>/);
});

test('feeds are valid XML whatever the jobs say', () => {
	assert.equal(xml('a\u0000b\u000bc & <d>'), 'abc &amp; &lt;d&gt;');
	const feed = atom({ title: 'T', subtitle: 'S', path: '/feed/in/berlin.xml', page: '/in/berlin', jobs: evil.jobs, names: evil.names, generatedAt: evil.generatedAt });
	assert.match(feed, /^<\?xml version="1.0" encoding="utf-8"\?>\n<feed xmlns="http:\/\/www.w3.org\/2005\/Atom">/);
	assert.match(feed, /<id>https:\/\/joblist.today\/feed\/in\/berlin.xml<\/id>/);
	assert.match(feed, /<link rel="self" type="application\/atom\+xml" href="https:\/\/joblist.today\/feed\/in\/berlin.xml"\/>/);
	// Updated: the newest entry's date; an entry without a date has the snapshot's.
	assert.match(feed, /<feed[^]*?<updated>2026-11-07T01:00:00Z<\/updated>/);
	assert.equal((feed.match(/<entry>/g) || []).length, 2, 'the javascript: link is left out');
	assert.match(feed, /<title>Designer &lt;img src=x onerror=alert\(1\)&gt;<\/title>/);
	assert.doesNotMatch(feed, /[\u0000-\u0008]/);
	assert.match(feed, /<updated>2026-11-02T17:49:00Z<\/updated>/);
	assert.match(feed, /<summary>Acme&lt;\/noscript&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt; · Berlin · Remote<\/summary>/);
});

test('a company feed names the company on each entry', () => {
	const { body, type } = render({ kind: 'feed', company: 'acme.org' }, { generatedAt: '2026-11-07T01:00Z', name: 'Acme', jobs: [{ t: 'Dev', u: 'https://a.example/9', p: '2026-11-03T08:00Z' }] }, '');
	assert.equal(type, 'atom');
	assert.match(body, /<title>New jobs at Acme<\/title>/);
	assert.match(body, /<author><name>Acme<\/name><uri>https:\/\/joblist.today\/company\/acme.org<\/uri><\/author>/);
	assert.match(body, /href="https:\/\/joblist.today\/feed\/company\/acme.org.xml"/);
});

test('headers: the page keeps the app policy and refuses framing; feeds run nothing', () => {
	assert.equal(pagePolicy(template), "script-src 'self'; frame-ancestors 'none'");
	assert.equal(pagePolicy('<html>'), "default-src 'none'; frame-ancestors 'none'");
	const page = headers('html', { policy: pagePolicy(template) });
	assert.equal(page['Content-Type'], 'text/html; charset=utf-8');
	assert.match(page['Cache-Control'], /^public, max-age=0, must-revalidate, s-maxage=\d+$/);
	const feed = headers('atom');
	assert.equal(feed['Content-Type'], 'application/atom+xml; charset=utf-8');
	assert.match(feed['Content-Security-Policy'], /default-src 'none'.*sandbox/);
	assert.match(feed['Cache-Control'], /^public, max-age=\d+$/);
	assert.equal(headers('html', { status: 503 })['Cache-Control'], 'no-store');
});
