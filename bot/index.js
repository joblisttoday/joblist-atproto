/**
 * Posts the day's new jobs on Bluesky, as a thread from joblist's own account
 * (bot/thread.js): run after each snapshot (.github/workflows/snapshot.yml), it
 * posts at most once in config.bot.minHours. It only posts: it never mentions,
 * replies to or writes to anyone. Dry run unless --write.
 *
 *   node bot/index.js static/snapshot                      # dry run: the thread it would post
 *   BOT_HANDLE=joblist.today BOT_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     node bot/index.js static/snapshot --write
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { lastDigest, postThread, signIn } from './bluesky.js';
import { threadPosts } from './thread.js';

const [dir = 'static/snapshot'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');

const posts = threadPosts(JSON.parse(readFileSync(join(dir, config.bot.file), 'utf8')));
if (!posts.length) {
	console.log('bot: no city with enough new jobs, nothing to post');
	process.exit(0);
}
for (const post of posts) console.log(`---\n${post.text}`);

if (!write) {
	console.log('\nDry run. Add --write with BOT_HANDLE and BOT_APP_PASSWORD to post.');
	process.exit(0);
}
const { BOT_HANDLE, BOT_APP_PASSWORD } = process.env;
if (!BOT_HANDLE || !BOT_APP_PASSWORD) throw new Error('bot: BOT_HANDLE and BOT_APP_PASSWORD are needed to post');

const session = await signIn(BOT_HANDLE, BOT_APP_PASSWORD);
const last = await lastDigest(session);
const hours = (Date.now() - last) / 36e5;
if (hours < config.bot.minHours) {
	console.log(`bot: last thread ${hours.toFixed(1)} hours ago, the next after ${config.bot.minHours}`);
	process.exit(0);
}
const refs = await postThread(session, posts, config.bot.pauseMs);
console.log(`bot: posted ${refs.length} posts, ${refs[0].uri}`);
