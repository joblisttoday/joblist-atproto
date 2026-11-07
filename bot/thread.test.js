import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { cityTag, cleanName, richText, threadPosts } from './thread.js';

const digest = {
	generatedAt: '2026-11-07T01:00Z',
	hours: 24,
	total: 664,
	cities: [
		{ slug: 'sao-paulo', name: 'São Paulo', count: 14, fields: [{ slug: 'engineering', count: 5 }, { slug: 'design', count: 3 }] },
		{ slug: 'berlin', name: '@alice.bsky.social https://evil.example Berlin', count: 12, fields: [] }
	]
};

test('facets count bytes, not characters', () => {
	const { text, facets } = richText(['São ', { text: 'link', link: 'https://joblist.today' }]);
	assert.equal(text, 'São link');
	assert.deepEqual(/** @type {any} */ (facets[0]).index, { byteStart: 5, byteEnd: 9 });
});

test('a thread: how many are new, then a post per city with its page and hashtag', () => {
	const posts = threadPosts(digest);
	assert.equal(posts.length, 3);
	assert.match(posts[0].text, /^664 new jobs in the last 24 hours/);
	assert.deepEqual(posts[0].tags, [config.bot.tag]);
	assert.equal(posts[1].text, 'São Paulo: 14 new jobs\nMost in Engineering (5), Design (3).\n\njoblist.today/in/sao-paulo #SãoPauloJobs');
	const features = posts[1].facets.map((/** @type {any} */ f) => f.features[0]);
	assert.deepEqual(features, [
		{ $type: 'app.bsky.richtext.facet#link', uri: 'https://joblist.today/in/sao-paulo' },
		{ $type: 'app.bsky.richtext.facet#tag', tag: 'SãoPauloJobs' }
	]);
	assert.equal(/** @type {any} */ (posts[1].embed).external.uri, 'https://joblist.today/in/sao-paulo');
	const segmenter = new Intl.Segmenter();
	for (const post of posts) assert.ok([...segmenter.segment(post.text)].length <= 300, 'Bluesky takes 300 graphemes');
});

test('never a mention or a link from a name', () => {
	const posts = threadPosts(digest);
	const berlin = posts[2];
	assert.ok(!berlin.text.includes('@'));
	assert.ok(!berlin.text.includes('https://evil'));
	assert.ok(berlin.facets.every((/** @type {any} */ f) => f.features[0].$type !== 'app.bsky.richtext.facet#mention'));
	assert.ok(posts.every((p) => !p.facets.some((/** @type {any} */ f) => f.features[0].uri && !f.features[0].uri.startsWith(config.url))));
	assert.equal(cleanName('Zürich <b>'), 'Zürich b');
	assert.equal(cityTag('New York'), 'NewYorkJobs');
	assert.equal(cityTag('...'), '');
});

test('nothing to post without cities', () => {
	assert.deepEqual(threadPosts({ generatedAt: '', hours: 24, total: 3, cities: [] }), []);
	assert.deepEqual(threadPosts(/** @type {any} */ (null)), []);
});
