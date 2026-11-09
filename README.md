# joblist

Open jobs at organizations that hire, read straight from their own job boards,
and lists of organizations curated by people on [atproto](https://atproto.com).
For people looking for work, and for projects looking for people to work with.

Anyone with a Bluesky (or any atproto) account can describe an organization,
make a list of them, or post a job. Every record lives in its author's own
account: nobody can take it down, rank it or sell it, and any other app can
read it. For organizations with a supported job board, open jobs are read
from that board.

It started as a hand-made spreadsheet of Berlin companies (joblistberlin), and
grew into joblist.today. This version keeps the part that worked, the
crowd-curated list of companies, with no database and no server of its own:
a static snapshot rebuilt every 6 hours, and a static site.

## Records

Four record types, defined in [`lexicons/`](lexicons/today/joblist):

- **`today.joblist.company`**: one company, keyed by its domain
  (`at://did:…/today.joblist.company/example.org`). Name, website,
  description, tags, locations, and where it hires (a job board provider and
  id, or a careers page). Companies work like wiki pages: anyone can edit one,
  and each person's edit is a record in their own account (with `updatedAt`).
  The app shows:
  1. the company's own record, if the author's handle is that domain (verified:
     the indexer checks it both ways, the domain's DNS `_atproto` record or
     `/.well-known/atproto-did` naming the account and the account's DID
     document naming the domain; without the snapshot, the AppView's word),
  2. otherwise the most recently edited version, by anyone: "edited" is when
     the indexer first saw that version (`versions.json` in the snapshot, see
     [`indexer/seen.js`](indexer/seen.js)), not the `updatedAt` its author
     writes, which anyone can set; without a snapshot, `updatedAt` (never in
     the future).

  The company page shows the history (every author's version); anyone can
  restore an older one, which saves its content as their own new version.
  Accounts listed in `bots` (config) are crawlers: their versions are marked
  "not checked by a person yet" until a person saves or confirms a newer one.
  So are versions from an account the indexer first saw less than
  `versions.newAccountDays` (config) before, written over someone else's
  version: a brand-new account cannot silently replace a long-standing page.
- **`today.joblist.list`**: a named list of companies (by domain), in the
  curator's order. Lists can be copied; the copy keeps a `copiedFrom` link.
  An `open` list takes contributions: companies others suggest appear in it
  at once, credited to them, and its author can hide any (`hidden`). For
  other lists, the author accepts or dismisses each suggestion.
- **`today.joblist.suggestion`**: a company suggested for someone else's
  list (`list` at-uri, `company` key, optional `note`), written in the
  contributor's own account.
- **`today.joblist.job`**: a job offer posted on joblist, in the poster's
  own account: title, company key, description, places, remote, contract,
  `url` (the full offer, or its joblist page), `apply` (a link, an email,
  and/or "message me on Bluesky") and `expiresAt`; optionally `salary`,
  `status` (filled or closed offers are hidden) and `updatedAt`.

Every field added later is optional; how keys are normalised and how to
publish the lexicons: [docs/lexicons.md](docs/lexicons.md).

## Posting jobs

Anyone signed in can post a job at `/jobs/new` (or "Post a job" on a company
page). When the poster's handle is the company's domain, the offer is shown
as **posted by the company** (✓); otherwise as **shared by @handle**. Offers
show up in every job list with that company, merged with its job board's
jobs (one per link), and get their own page at `/job/{did}/{rkey}`,
prerendered with schema.org `JobPosting` data for search engines.

Once a company speaks for itself (its own account's version is shown, or it
posted a job itself), offers others post for it are no longer shown as its
jobs: not in job lists, feeds, embeds or the snapshot, and their page is not
prerendered. Opened by its link, such an offer says in red that it is not from
the company, with no link to apply or to the offer: anyone can post, and a fake
offer in a real company's name is how phishing collects applications.

Offers are shown for 30 days by default (120 at most, see `jobPost` in
config); expired ones are hidden everywhere, in the app and the snapshot.
Their poster can edit, renew or delete them from the offer, the company
page or their profile.

**Applications never go through joblist.** joblist has no server and keeps
nothing private: no tokens beyond the browser's own OAuth session, no
passwords, no messages, no CVs. The offer only says where to apply: the
company's form, an email (`mailto:`), or the poster's Bluesky profile to
message them there (Bluesky has no public link that starts a conversation,
and joblist never asks for chat access). What candidates send goes from
them to the poster, outside joblist.

Later, atproto's planned private data ("permissioned spaces") could hold
things that should not be public, like an application shared only with the
poster. Until that exists, nothing private is written.

## How it runs

A static SvelteKit app (it runs in the browser), served by Cloudflare, and a
snapshot of the network rebuilt every 6 hours by the indexer ([`indexer/`](indexer),
`.github/workflows/snapshot.yml`) and published to
[joblisttoday/joblist-snapshot](https://github.com/joblisttoday/joblist-snapshot):
every record, every open job, one small file per organization and per list.
The app reads the snapshot; only the signed-in person's own records are read
live, from their own server.

| What | How |
|---|---|
| Find all records (indexer) | the relay's `com.atproto.sync.listReposByCollection`, then `com.atproto.repo.listRecords` on each author's PDS |
| Names and verified handles | the public Bluesky AppView (`app.bsky.actor.getProfiles`); handles that make an account a company's own are checked again both ways by the indexer ([`indexer/handles.js`](indexer/handles.js)) |
| Open jobs | each job board's public API (Ashby, Greenhouse, Lever, Personio, Recruitee, Rippling, SmartRecruiters, Workable) |
| Sign in and write | atproto OAuth (`@atproto/oauth-client-browser`), asking only for the app's record types |
| Map | MapLibre with OpenFreeMap tiles |

It works offline on what it read last: a service worker
([`src/service-worker.js`](src/service-worker.js)) keeps the app and the
snapshot files it read, and IndexedDB keeps the network copy and the outbox,
where a write that cannot reach its author's server waits to be sent, in
order ([`src/lib/network/outbox.svelte.js`](src/lib/network/outbox.svelte.js)).

Pages per city and per field (`/in/berlin`, `/field/design`,
`/in/berlin/design`, indexes at `/in` and `/field`), their Atom feeds
(`/feed/new.xml`, `/feed/in/<city>.xml`, `/feed/field/<field>.xml`,
`/feed/company/<key>.xml`) and their sitemap (`/sitemap-places.xml`) are the
only addresses served by code: a small Worker ([`worker/`](worker)) renders
them from the latest snapshot, so they are as fresh as the data, not as the
last deploy. The indexer writes one small file per page into the snapshot
(`landing/`, see [`indexer/landing.js`](indexer/landing.js)); the Worker reads
only that file and keeps its answer in the cache for half an hour. Only these
addresses run it (`assets.run_worker_first` in `wrangler.jsonc`): every other
file is served without it. Fields and their words are in
[`src/lib/data/fields.json`](src/lib/data/fields.json), cities' other
spellings in `landing.cityAliases` (config).

Cost: €0/month.

## Develop

Node 24 (see `.nvmrc`) and npm 11.

```sh
npm install
npm run dev -- --host 127.0.0.1   # sign-in works on 127.0.0.1, not localhost
npm test
npm run check
npm run test:e2e                  # quality gate on the built site (Playwright)
npm run gate:check                # is e2e/quality.js the shared kit's latest?
```

Configuration lives in data files, not code:

- [`src/lib/data/config.json`](src/lib/data/config.json): services, map, limits, locales
- [`src/lib/data/providers.json`](src/lib/data/providers.json): job board providers
- [`src/lib/i18n/locales/`](src/lib/i18n/locales): interface text (English, French, German, Spanish: every key in each)
- [`src/lib/data/need-lists.json`](src/lib/data/need-lists.json): lists by need, from the commons map (`scripts/curate-lists.js`)
- [`scripts/starter-lists.json`](scripts/starter-lists.json): lists created by the import

The Worker locally, on a built site (`npm run build:site`), reading a
snapshot from `static/snapshot` served by any static server (set
`SNAPSHOT=http://127.0.0.1:<port>` in `.dev.vars`; without it, the published
snapshot):

```sh
npx wrangler dev --port 8802 --ip 127.0.0.1   # then /in/berlin, /feed/new.xml
```

## Deploy

Cloudflare Workers Builds deploys `main` on every push (connected to this
GitHub repository in the dashboard, no token):

- Build command: `npm run build:site` (downloads the published snapshot, builds the app, prerenders pages; `npm run index` builds a snapshot locally)
- Deploy command: `npx wrangler deploy`

By hand:

```sh
npm run deploy   # build:site && wrangler deploy → https://joblist.today
```

[`static/client-metadata.json`](static/client-metadata.json) must match the
deployed origin.

Workflows ([`.github/workflows/`](.github/workflows)):

| Workflow | When | What |
|---|---|---|
| `snapshot` | every 6 hours | the snapshot, published; then the site rebuilt (`SITE_DEPLOY_HOOK`) and the weekly post (`bot/`) |
| `crawl` | Mondays | the crawler ([docs/crawler.md](docs/crawler.md)) |
| `lexicons` | by hand, by the owner | publishes the changed schemas ([docs/lexicons.md](docs/lexicons.md)) |
| `gate` | each push, Mondays | the quality gate on the built site |
| `curate-lists` | by hand | lists by need: a plan, or with `write` the records |

Only the site's own scripts may run (`kit.csp` in `vite.config.js`). The page
view counter (Umami) is a pinned copy served from the site,
[`static/vendor/umami.js`](static/vendor/umami.js), sending to Umami Cloud's
collector (`analytics.hostUrl`): a third party cannot change code that runs
next to people's sessions. Cloudflare's Web Analytics would inject its own
beacon (`static.cloudflareinsights.com`), which the policy refuses: keep
Web Analytics turned off for joblist.today in the Cloudflare dashboard.

## Import joblist's companies

The historical joblist data (CC0, [joblisttoday/data](https://github.com/joblisttoday/data))
can be published as records from one account, with starter lists by city and tag:

```sh
node scripts/import-joblist.js <companies-dir>              # dry run
JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=… \
  node scripts/import-joblist.js <companies-dir> --write    # publish
```

Re-running updates the records instead of duplicating them.

The old site's company pages (`/<slug>`) redirect to `/company/<key>` through
[`static/_redirects`](static/_redirects), generated from the same folders:

```sh
node scripts/legacy-redirects.js <companies-dir>
```

## Check and repair companies

Job boards and websites change; these scripts find what broke
(see [docs/growing-the-list.md](docs/growing-the-list.md)):

```sh
node scripts/check-companies.js health.json            # read-only health report
node scripts/repair-companies.js health.json            # proposed fixes, dry run
JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=… \
  node scripts/repair-companies.js health.json --write  # apply high-confidence fixes
```

## License

Code: GPL-3.0-or-later, like the rest of joblist. Records belong to their authors.
