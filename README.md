# joblist

A tool for a job hunt, in the browser: paste an organization's link, and joblist
reads its open jobs straight from its own job board and its Bluesky account; save
the ones you like, tagged, in your own browser, and search their jobs together.
An organization describes itself and posts its jobs on [atproto](https://atproto.com),
from its own account. For people looking for work, and for projects looking for
people to work with.

joblist keeps no list of organizations or jobs, and nothing of anyone's: it is
static files, and everything is read by each person's browser, from the source.
Every record lives in its author's own account: nobody can take it down, rank it
or sell it, and any other app can read it.

It started as a hand-made spreadsheet of Berlin companies (joblistberlin), and grew
into joblist.today, then a crowd-curated list; it is a tool now.

## Records

Two record types joblist reads, defined in [`lexicons/`](lexicons/today/joblist):

- **`today.joblist.company`**: one company, keyed by its domain
  (`at://did:…/today.joblist.company/example.org`). Name, website,
  description, tags, locations, and where it hires (a job board provider and
  id, or a careers page). An organization writes its own page: joblist reads it
  from the account whose handle is that domain (verified both ways by the Bluesky
  AppView), when its page (`/{domain}`) opens. No one else's version is shown.
- **`today.joblist.job`**: a job offer posted on joblist, in the poster's
  own account: title, company key, description, places, remote, contract,
  `url` (the full offer, or its joblist page), `apply` (a link, an email,
  and/or "message me on Bluesky") and `expiresAt`; optionally `salary`,
  `status` (filled or closed offers are hidden) and `updatedAt`.

`today.joblist.list` and `today.joblist.suggestion` (lists of organizations, and
organizations suggested for them) were published before, and joblist no longer reads
them: lists kept in a browser became saved organizations, tagged with the list's name.

Every field added later is optional; how keys are normalised and how to
publish the lexicons: [docs/lexicons.md](docs/lexicons.md).

## Posting jobs

Anyone signed in can post a job at `/jobs/new` (or "Post a job" on a company
page). When the poster's handle is the company's domain, the offer is shown
as **posted by the company** (✓); otherwise as **shared by @handle**. Offers
show up in every job list with that company, merged with its job board's
jobs (one per link), and get their own page at `/job/{did}/{rkey}`.

Once a company speaks for itself (its own account's version is shown, or it
posted a job itself), offers others post for it are no longer shown as its
jobs. Opened by its link, such an offer says in red that it is not from
the company, with no link to apply or to the offer: anyone can post, and a fake
offer in a real company's name is how phishing collects applications.

Offers are shown for 30 days by default (120 at most, see `jobPost` in
config); expired ones are hidden everywhere.
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

Static files on GitHub Pages ([`.github/workflows/pages.yml`](.github/workflows/pages.yml),
on each push to `main`): a SvelteKit app that runs in the browser, and the site's own
pages written after the build ([`site/site.js`](site/site.js)). Any other address
(`/{domain}`, `/job/…`) gets `404.html`, on which the app starts and shows it.
More: [docs/architecture.md](docs/architecture.md).

| What | How, from the browser |
|---|---|
| An organization | its own atproto account (its handle is its domain): its record and job offers from its server; else what is found of the domain (its Bluesky account, a job board in its link) |
| Names and handles | the public Bluesky AppView (`app.bsky.actor.getProfiles`, handles verified both ways) |
| Open jobs | each job board's public API (Ashby, Greenhouse, Lever, Personio, Recruitee, Rippling, SmartRecruiters, Workable), a few boards at a time |
| Saved organizations, searches, jobs | this browser only (localStorage, IndexedDB); moved with a file (Menu) |
| Sign in and write | atproto OAuth (`@atproto/oauth-client-browser`), asking only for the app's record types |
| Map | MapLibre with OpenFreeMap tiles |

It opens offline: a service worker ([`src/service-worker.js`](src/service-worker.js))
keeps the app, IndexedDB what was read and the outbox, where a write that cannot
reach its author's server waits to be sent, in order
([`src/lib/network/outbox.svelte.js`](src/lib/network/outbox.svelte.js)).

Cost: €0/month.

## Develop

Node 24 (see `.nvmrc`) and npm 11.

```sh
npm install
npm run dev -- --host 127.0.0.1   # sign-in works on 127.0.0.1, not localhost
npm test
npm run check
npm run test:e2e                  # quality gate on the built site (Playwright)
npm run build:site                # what GitHub Pages serves, in build/
```

Configuration lives in data files, not code:

- [`src/lib/data/config.json`](src/lib/data/config.json): services, map, limits, locales
- [`src/lib/data/providers.json`](src/lib/data/providers.json): job board providers
- [`src/lib/i18n/locales/`](src/lib/i18n/locales): interface text (English, French, German, Spanish: every key in each)

The embed (`<joblist-jobs board="greenhouse:acme">`, [`embed/src/`](embed/src/JoblistJobs.svelte)):
an organization's open jobs on its own site, read live from its job board by the visitor's
browser. Built to `embed/dist`, kept in the repository, so jsDelivr serves it from GitHub:
`https://cdn.jsdelivr.net/gh/joblisttoday/joblisttoday@<tag>/embed/dist/joblist-jobs.js`;
the site serves a copy at `/embed/joblist-jobs.js`. `npm run build:embed` after changing it
(a test says when it is out of date).

The Firefox add-on ([`extension/`](extension/README.md)): on any website, its job board and
open jobs, its social profiles; save and tag it in the browser (the same as "Your
organizations" here).

```sh
npm run build:extension           # extension/dist: load its manifest.json in about:debugging
```

## Deploy

GitHub Pages, from the `pages` workflow on each push to `main` (Settings → Pages →
Source: GitHub Actions). The domain is the build's `CNAME` (joblist.today): its DNS
points to GitHub Pages. [`static/client-metadata.json`](static/client-metadata.json)
must match the deployed origin.

Only the site's own scripts may run (`kit.csp` in `vite.config.js`). The page view
counter (Umami) is a pinned copy served from the site,
[`static/vendor/umami.js`](static/vendor/umami.js).

The `lexicons` workflow publishes the changed schemas, by hand, by the owner
([docs/lexicons.md](docs/lexicons.md)).

## License

Code: GPL-3.0-or-later, like the rest of joblist. Records belong to their authors.
