# Architecture

joblist is a tool that runs in each person's browser. It keeps nothing of its own: no list
of organizations, no index of jobs, no server. What it shows is read from the source, by
the browser, when it is asked for.

## The pieces

| Piece | Where it runs | What it reads |
|---|---|---|
| The app (SvelteKit, `ssr = false`) | GitHub Pages, static files (`pages` workflow, on each push) | job boards' public APIs, organizations' own atproto accounts, the Bluesky AppView, Wikidata (a name's organizations, asked once per name) |
| The site's own pages (`site/site.js`) | written after the build | nothing: what joblist is, never numbers |
| The browser add-on (`extension/`) | the person's browser, on any website | the page open, its job board, its Bluesky handle |
| The embed (`embed/`, `<joblist-jobs board="…">`) | organizations' own websites; jsDelivr and the site serve it | its job board, live |
| Lexicon publishing (`lexicons` workflow) | by hand, by the owner | the schemas in `lexicons/` |

One repository, two workflows, one host, no secret but the lexicon account's password.

## The contracts

Pieces share no code path at run time; they share these:

| Contract | What | Where it is written |
|---|---|---|
| Records | `today.joblist.company` (an organization, keyed by its domain), `today.joblist.job` (a job offer), in their authors' own accounts | [lexicons/](../lexicons), [docs/lexicons.md](lexicons.md) |
| Job boards | each provider's public API, read the same way everywhere | [src/lib/ats/](../src/lib/ats), [providers.json](../src/lib/data/providers.json) |
| Saved organizations | `joblist.kept.v1` in the browser: link, name, tags, job board; the add-on keeps the same list | [src/lib/models/kept.js](../src/lib/models/kept.js) |
| The move file | what a browser keeps, as a file to import in another one (Menu) | [src/lib/models/job-collection.js](../src/lib/models/job-collection.js) |

## In atproto

- An organization is its own account: its handle is its domain, and its page here
  (`/{domain}`) reads its `today.joblist.company` record and its `today.joblist.job` offers
  from its own server when the page opens. No one else's version is shown.
- An organization signs in with its domain as its handle (OAuth, asking only for the app's
  record types) to describe itself and post its jobs; what it writes is in its own account.
  No one publishes about another organization: records about a domain from any other
  account are not read.
- Any other app can read the same records.

## Politeness

Each browser reads a few job boards at a time (`config.kept.boardsPerVisit`), keeps what it
read for a while (`config.kept.refreshHours`), and asks nothing about a site someone only
visits: the add-on's button is decided from what is saved, in the browser.

## What was removed (2026-11-11), and why

The indexer, the snapshot (a copy of every organization and job, every 6 hours), the
Worker (pages per city and field, feeds), the crawler, the weekly bot, and Cloudflare: a
list of organizations and jobs kept by joblist is what joblist is not anymore. Their code
is in the repository's history.
