# Architecture

joblist runs in each person's browser. It keeps nothing of its own: no list of
organizations, no index of jobs, no server. What it shows is read, when a page opens, from
the organization's own atproto account; what an organization writes goes to that account.

## The pieces

| Piece | Where it runs | What it reads |
|---|---|---|
| The app (SvelteKit, `ssr = false`) | GitHub Pages, static files (`pages` workflow, on each push) | an organization's account: its identity (PLC, or `did:web`), its records on its own server, its Bluesky picture (the public AppView) |
| The site's own pages (`site/site.js`) | written after the build | nothing: what joblist is |
| The embed (`embed/`, `<joblist-jobs organization="acme.org">`) | organizations' own websites; jsDelivr and the site serve it | the organization's account, the same way |
| Lexicon publishing (`lexicons` workflow) | by hand, by the owner | the schemas in `lexicons/` |

## Pages

| Address | What it is |
|---|---|
| `/` | what joblist does; open an organization's page by its domain; for an organization, to sign in (signed in: its page) |
| `/signin` | sign in with an organization's domain as its handle; then its page |
| `/settings` | the language; the account signed in here, sign out |
| `/{domain}` | an organization: its description and its open jobs. Its own account also has Edit, Post a job, On your website, its offers no longer shown, and the steps until it has described itself and posted |
| `/{domain}/edit` | describe it (its own account) |
| `/{domain}/post` | post a job (its own account) |
| `/{domain}/embed` | its jobs on a website: a frame or an element to paste (anyone) |
| `/job/{did}/{rkey}` | a job offer: where, how, where to apply; its own account edits or deletes it |
| `/job/{did}/{rkey}/edit` | change an offer, or show it longer (its own account) |
| `/embed/?organization=…` | the frame the embed snippet opens (`static/embed/`) |

Pages of an organization's own account (`OwnOnly`) ask anyone else to sign in as it.
`/signin` and `/settings` are written as pages of their own (`site/site-pages.js`, not
indexed), so they answer 200.

## The code

- `src/lib/atproto.js`: reading atproto with `fetch` (a handle's account, its server, its
  handle confirmed both ways, its records, record keys).
- `src/lib/session.svelte.js`: signing in with OAuth, one account; writing to it.
- `src/lib/records.js`: what pages show of a record, what forms write.
- `src/lib/profile.js`: an organization's profile, a job offer.
- `src/service-worker.js`: removes the offline worker earlier versions installed.

## The contracts

| Contract | What | Where it is written |
|---|---|---|
| Records | `today.joblist.company` (an organization, keyed by its domain), `today.joblist.job` (a job offer), in their authors' own accounts | [lexicons/](../lexicons), [docs/lexicons.md](lexicons.md) |
| A job's address | `/job/{did}/{rkey}`, kept in its record's `url` when it has no other | `config.jobPost.page` |
| The embed | `<joblist-jobs organization="…" lang="…" limit="…">`, `/embed/?organization=…` | [embed/src/](../embed/src) |
