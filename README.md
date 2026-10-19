# joblist

Companies that hire, curated by people, on [atproto](https://atproto.com).

Anyone with a Bluesky (or any atproto) account can describe a company or make a
list of companies. Every record lives in its author's own account: nobody can
take it down, rank it or sell it, and any other app can read it. For companies
with a supported job board, open jobs are read live from that board.

It started as a hand-made spreadsheet of Berlin companies (joblistberlin), and
grew into joblist.today. This version keeps the part that worked, the
crowd-curated list of companies, and drops everything else: no database, no
crawler, no server.

## Records

Two record types, defined in [`lexicons/`](lexicons/today/joblist):

- **`today.joblist.company`**: one company, keyed by its domain
  (`at://did:…/today.joblist.company/example.org`). Name, website,
  description, tags, locations, and where it hires (a job board provider and
  id, or a careers page). Anyone can write one about any company; when several
  people do, the app shows:
  1. the company's own record, if the author's handle is that domain (verified),
  2. otherwise the viewer's own version,
  3. otherwise the oldest one.
- **`today.joblist.list`**: a named list of companies (by domain), in the
  curator's order. Lists can be copied; the copy keeps a `copiedFrom` link.

## How it runs

A static SvelteKit app, served by a Cloudflare Worker (assets only, no code).
Everything happens in the browser:

| What | How |
|---|---|
| Find all records | the relay's `com.atproto.sync.listReposByCollection`, then `com.atproto.repo.listRecords` on each author's PDS |
| Names and verified handles | the public Bluesky AppView (`app.bsky.actor.getProfiles`) |
| Open jobs | each job board's public API (Ashby, Greenhouse, Lever, Personio, Recruitee, Rippling, SmartRecruiters, Workable) |
| Sign in and write | atproto OAuth (`@atproto/oauth-client-browser`), asking only for the two record types |
| Map | MapLibre with OpenFreeMap tiles |

The last network load is kept in `localStorage` so pages show at once. Loading
is one request per contributing account: fine for hundreds of contributors.
Past that, a static snapshot file can be added as a cache, with the records
staying the source of truth.

Cost: €0/month.

## Develop

Node 24 (see `.nvmrc`) and npm 11.

```sh
npm install
npm run dev -- --host 127.0.0.1   # sign-in works on 127.0.0.1, not localhost
npm test
npm run check
```

Configuration lives in data files, not code:

- [`src/lib/data/config.json`](src/lib/data/config.json): services, map, limits, locales
- [`src/lib/data/providers.json`](src/lib/data/providers.json): job board providers
- [`src/lib/i18n/locales/`](src/lib/i18n/locales): interface text (English, French)
- [`scripts/starter-lists.json`](scripts/starter-lists.json): lists created by the import

## Deploy

```sh
npm run deploy   # vite build && wrangler deploy → https://atproto.joblist.today
```

[`static/client-metadata.json`](static/client-metadata.json) must match the
deployed origin.

## Import joblist's companies

The historical joblist data (CC0, [joblisttoday/data](https://github.com/joblisttoday/data))
can be published as records from one account, with starter lists by city and tag:

```sh
node scripts/import-joblist.js <companies-dir>              # dry run
JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=… \
  node scripts/import-joblist.js <companies-dir> --write    # publish
```

Re-running updates the records instead of duplicating them.

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
