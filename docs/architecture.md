# Architecture

joblist is a few pieces that talk to each other only through public formats: each can be
deployed, replaced or left out on its own. This page says what they are today, what they
should become (fewer, decoupled), and the steps there, each one reversible.

## The contracts

Pieces never share code paths at run time or at build time; they share these:

| Contract | What | Where it is written |
|---|---|---|
| Lexicons | the `today.joblist.*` records people write in their own accounts | [lexicons/](../lexicons), published by hand ([lexicons.md](lexicons.md)) |
| Index format | the static files an indexer writes and clients read, with a `version` | `docs/index.md` (to write, step 3) |
| Addresses | pages (`/company/{domain}`, `/in/{city}`) and their state after the `#` (`#q=…&where=…`) | [src/lib/navigation/address.js](../src/lib/navigation/address.js) |
| Private data | what a person keeps in their browser (searches, organizations, tags) | `src/lib/local/`, `src/lib/network/kept.svelte.js`; the add-on syncs it ([extension/](../extension/README.md)) |

## In atproto

| atproto role | joblist |
|---|---|
| PDS (each person's server) | the source of truth: organizations, jobs written by their authors; the app writes there (local-first, an outbox when offline) |
| Lexicons | the contract every piece reads |
| Identity | an organization signed in with its domain as handle is verified |
| Relay, Jetstream | not used yet; the indexer reads accounts every 6 hours (later: follow Jetstream for `today.joblist.*` only) |
| AppView (an index) | the indexer and its static index: one index among others, which anyone can run |
| Labeler | not used yet; later: read moderation labelers people trust (instead of `blocklist.json`), maybe publish "hiring" on organizations' accounts |
| Clients | the app, the add-on, and any other app reading the same records |

Private data never leaves the browser; public data lives in its author's PDS; every shared
service (index, labeler, feeds) is optional and replaceable.

## Today: 11 pieces

| # | Piece | Runs | Needs |
|---|---|---|---|
| 1 | App (static, offline cache, embeds) | Cloudflare, on push | — |
| 2 | Prerender (organization pages' HTML) | in 1's build | the index at build time |
| 3 | Worker (`/in`, `/field`, feeds, sitemap) | Cloudflare, with 1 | the index at each request |
| 4 | Indexer | GitHub workflow, every 6 h | — |
| 5 | Index host (`joblisttoday/joblist-snapshot`) | GitHub Pages | `SNAPSHOT_DEPLOY_KEY` |
| 6 | Deploy hook (index → rebuild 1) | end of 4 | `SITE_DEPLOY_HOOK` (failing since 2026-11-08) |
| 7 | Bot (the week's trends on Bluesky) | end of 4 | `BOT_HANDLE`, `BOT_APP_PASSWORD` |
| 8 | Crawler (repairs and adds organizations) | GitHub workflow, weekly | the crawler account's password |
| 9 | List curation | GitHub workflow, by hand | an account's password |
| 10 | Lexicon publishing | GitHub workflow, by hand | an account's password |
| 11 | Browser add-on | built with 1, served at `/apps` | — |
| 12 | Embed (`<joblist-jobs>`) | on organizations' own sites; served by jsDelivr from this repository, and by 1 | nothing: reads the board live (an index only for `company="…"`) |

Two repositories, four workflows, two hosts, six secrets. The couplings: the app's build reads
the index (2), the index rebuilds the app (6), the Worker reads the index (3).
Steps 1 and 2 removed 2 and 6: the site is built from no index (`indexer/site.js`), and
organization and job pages are one page each, served for any of them by a rewrite.

## Target: 3 pieces, and the embed

| Piece | Runs | Needs |
|---|---|---|
| App, with the add-on | any static host (Cloudflare today), on push | nothing; an index if one is set |
| Embed | organizations' sites, from jsDelivr (this repository) | nothing: the board, read live |
| Indexer | one scheduled job, publishing the index to this repository's GitHub Pages, with static feeds | GitHub's own token |
| Lexicons | by hand, rarely | an account's password, when used |

One deploy on push, one scheduled job, no secret on a schedule: nothing writes to atproto on
its own, nothing breaks between two systems, and anyone can run the same on any static host.

The app without an index is a notebook: the organizations a person keeps, and the ones read
straight from the accounts that publish them (the joblist.today account: about 10 requests),
their jobs read live from their boards (a few dozen at most), kept in the browser, offline.
With an index, it searches every job, and shows counts, fields and places.

What it costs: search engines see less (organization and city pages exist inside the app
only); the crawler's weekly repairs stop unless run by hand; no weekly post on Bluesky.

## Steps

Each step is a commit, checked (types, unit tests, the built site's tests, 390px and 1440px),
and reversible on its own.

1. **Done (2026-11-11).** **The app's build reads no index.** Remove the prerender (2) from `build:site`; organization,
   job and list pages are the app's (`404.html` already starts the app on any address). The
   home's and `/stats`' titles say no numbers. Check: the build runs offline.
2. **Done (2026-11-11).** **No deploy after an index.** Remove the deploy hook step (6) and its secret: an index never
   rebuilds the app. Check: the snapshot workflow succeeds.
3. **The index format, written down.** `docs/index.md`: each file (`records.json`, `jobs.json`,
   `counts.json`, `first.json`, `companies/{domain}.json`, `landing/`, `places.json`…), its fields,
   a `version` in each. The app and the add-on read only what it says.
4. **The index's address is a setting.** `config.snapshot.path` by default; Menu lets a person
   point to another index, or none. Check: with none, the app works as a notebook (offline too).
5. **The index on this repository's Pages.** The indexer publishes with GitHub's token, not a
   deploy key to a second repository (5); the old address redirects or stays a while.
6. **Feeds as static files.** The indexer writes the feeds per city, field and organization into
   the index; feeds of any free-text search go away.
7. **No Worker.** `/in`, `/field` and the sitemap become the app's pages and a static sitemap
   (3). Check: old addresses still open their page.
8. **Optional jobs by hand.** The bot (7) and the crawler (8) run only when started by hand
   (`workflow_dispatch`), or not at all; list curation (9) goes with lists.

Later, each independent of the rest: the indexer follows Jetstream (changes in minutes);
the app reads moderation labelers instead of the blocklist; a joblist labeler publishes
"hiring" on organizations' Bluesky accounts.
