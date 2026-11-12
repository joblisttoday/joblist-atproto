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

## Information architecture

One app, the same for everyone: three tabs, at the bottom at every width
(`src/lib/components/Nav.svelte`, `src/lib/data/nav.json`). It says what it does and how,
plainly: a tool, no marketing.

| Tab | Page |
|---|---|
| `/` **Home** | the search (a name, a link, a list), then a dashboard, each row a way into Explore: the new jobs of your searches, your lists of jobs with their counts, your tags, the organizations followed last; before following any, how it works (four lines) and the box to start |
| **Explore** | one view, two parts, switched at its top (`ExploreTabs`); its tab opens the part last used. `/companies` **Organizations**: the ones followed, by tag (`#tag=…`), and the box to follow another. `/jobs` **Jobs**: their jobs (with searches saved, only those matching one of them: "Your searches", the default; each search; All jobs), and your lists as chips: Open jobs, Saved, Applied, Hidden, the ones you name (`/jobs/{id}`), a new one |
| `/menu` **Menu** | who you are (opens your profile), Switch account, Sign in (signed out: for organizations), Language, Move to another device, Apps and add-on, Source code; joblist's mark at the end |

- Everyone is a profile, with the same view: an account at `/{domain}` (an organization's
  careers page), this device at `/{name}.local` (`DeviceProfile`: its name, and links to what
  it keeps, in Explore; private; one per browser, renamable, `src/lib/local/device.svelte.js`).
  There is no `/org`, `/me` nor `/saved`.
- Inside Explore: `/{domain}` an organization · `/{domain}/embed` its jobs on a website · `/job/{did}/{rkey}` a posted job · `/jobs/{id}` a list of jobs · `/explore/list` follow a Bluesky list · `/explore/organization#url=…` a link's organization.
- An organization's tools are under its page, its own account's only (`OwnOnly`: anyone else
  is asked to sign in as it): `/{domain}/edit` its page's parts (`?field=…` one alone, `?all`
  everything, `?url=…` what a link gives), `/{domain}/post` post a job, `/{domain}/jobs/{rkey}`
  edit an offer. Its own page shows it, until its jobs are listed, what to do in order
  (`OrganizationSetup`: describe it; link its job board or post jobs here; optionally, show
  them on its website), then its offers (to edit or renew); its "…" has Edit, Post a job,
  Show these jobs on your site. `/signin` says how to sign in with a domain.
- Old addresses that still lead somewhere (`src/lib/components/Redirect.svelte`), with what
  follows the `?` and `#`: `/following` → `/companies`, `/following/list` → `/explore/list`, `/apps` → `/menu/apps`.
- A change to a page, a tab or an address is checked against this table first; the table
  changes with it.

## Rows and chips

Every thing listed (a job, an organization, an offer, a list, an account, a setting) is a
row with the same anatomy (`src/lib/components/Row.svelte`; a job's is `JobItem`/`JobCard`,
shared with the embed):

```
[avatar]  Title                                  [trailing]
          (chip) meta · meta · meta
```

- **Avatar**: an organization's picture, else its initial in its own color (`JobAvatar`);
  a list or a setting has an icon.
- **Title**: what you tap; the whole row opens it.
- **Meta**: one muted line, in this order: organization · place and team · workplace · pay
  · when. Facts are text, not pills.
- **Chip** (`<jl-chip tone=…>`, one style in `app.css`): at most one state per row, first on
  the meta line: new (filled), ok (Applied, 27 this week, 30 days left, In use, on joblist),
  warn (Expired, ending soon, Look for it, listed for long).
- **Trailing**: one of a count, a checkbox, or "…" (its actions: Save, Hide, Unfollow, Edit,
  Renew, Delete…); › when it goes somewhere. No buttons or × inside a row.
- Filter chips (teams, tags, saved searches) are pressed buttons above a list, not rows.
- A page is made from its data: a filter or a view the data cannot answer is left out (no
  map nor "Near me" when no job has a place; no "Remote" when none is remote), unless it is
  on (to turn it off); with no data, the page says how to get some, where you are.

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
