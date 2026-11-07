import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { cleanName, weeklyPost } from './post.js';

const stats = {
	generatedAt: '2026-11-14T01:00Z',
	since: '2026-11-06T21:00Z',
	weeks: [],
	now: {
		open: 34340,
		companies: 364,
		newWeek: 4120,
		newWeekBefore: 3800,
		daysOpen: 44,
		workplace: {},
		payShown: 10000,
		fields: [{ slug: 'engineering', open: 13000, pay: {} }, { slug: 'sales', open: 4000, pay: {} }, { slug: 'data', open: 3800, pay: {} }, { slug: 'design', open: 1000, pay: {} }],
		cities: [{ slug: 'new-york', name: 'New York', open: 1780 }, { slug: 'x', name: '@alice.bsky.social https://evil.example', open: 900 }, { slug: 'london', name: 'London', open: 800 }, { slug: 'paris', name: 'Paris', open: 300 }]
	}
};

test('the weekly post: counts, cities and fields, a link to the trends', () => {
	const post = weeklyPost(stats);
	assert.ok(post);
	assert.match(post.text, /^This week on joblist: 4,120 new jobs, 8% more than the week before\. 34,340 open now at 364 companies/);
	assert.match(post.text, /Most open jobs: New York 1,780, alice\.bsky\.social httpsevil\.example 900, London 800\./);
	assert.match(post.text, /Hiring the most: Engineering, Sales, Data and AI\./);
	assert.ok(post.text.endsWith('joblist.today/stats'));
	assert.ok(!post.text.includes('@') && !post.text.includes('https://'), 'no mention, no link but ours');
	const facet = /** @type {any} */ (post.facets[0]);
	assert.equal(new TextDecoder().decode(new TextEncoder().encode(post.text).slice(facet.index.byteStart, facet.index.byteEnd)), 'joblist.today/stats');
	assert.deepEqual(post.tags, [config.bot.tag]);
	assert.ok([...new Intl.Segmenter().segment(post.text)].length <= 300, 'Bluesky takes 300 graphemes');
});

test('the first weeks say no change; nothing to say, no post', () => {
	assert.match(weeklyPost({ ...stats, now: { ...stats.now, newWeekBefore: null } })?.text || '', /^This week on joblist: 4,120 new jobs\. /);
	assert.equal(weeklyPost(null), null);
	assert.equal(cleanName('Zürich <b>'), 'Zürich b');
});
