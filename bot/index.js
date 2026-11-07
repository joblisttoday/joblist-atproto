/**
 * Posts the week's trends on Bluesky from joblist's own account (bot/post.js): run
 * after each snapshot (.github/workflows/snapshot.yml), it posts at most once in
 * config.bot.minHours. It only posts: it never mentions, replies to or writes to
 * anyone. Dry run unless --write.
 *
 *   node bot/index.js static/snapshot                      # dry run: the post it would make
 *   BOT_HANDLE=joblist.today BOT_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     node bot/index.js static/snapshot --write
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { createPost, lastPost, signIn } from './bluesky.js';
import { weeklyPost } from './post.js';

const [dir = 'static/snapshot'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');

const post = weeklyPost(JSON.parse(readFileSync(join(dir, config.stats.file), 'utf8')));
if (!post) {
	console.log('bot: no trends to post');
	process.exit(0);
}
console.log(post.text);

if (!write) {
	console.log('\nDry run. Add --write with BOT_HANDLE and BOT_APP_PASSWORD to post.');
	process.exit(0);
}
const { BOT_HANDLE, BOT_APP_PASSWORD } = process.env;
if (!BOT_HANDLE || !BOT_APP_PASSWORD) throw new Error('bot: BOT_HANDLE and BOT_APP_PASSWORD are needed to post');

const session = await signIn(BOT_HANDLE, BOT_APP_PASSWORD);
const last = await lastPost(session);
const hours = (Date.now() - last) / 36e5;
if (hours < config.bot.minHours) {
	console.log(`bot: last post ${hours.toFixed(1)} hours ago, the next after ${config.bot.minHours}`);
	process.exit(0);
}
const ref = await createPost(session, post);
console.log(`bot: posted ${ref.uri}`);
