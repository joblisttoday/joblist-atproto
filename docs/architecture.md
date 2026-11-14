# Architecture

joblist runs in each person's browser. It keeps nothing of its own: no list of
organizations, no index of jobs, no server. What it shows is read, when a page opens, from
the organization's own atproto account; what an organization writes goes to that account.

## The pieces

| Piece | Where it runs | What it reads |
|---|---|---|
| The app (SvelteKit, `ssr = false`) | GitHub Pages, static files (`pages` workflow, on each push) | an organization's account: its identity (PLC, or `did:web`), its records on its own server, its Bluesky picture (the public AppView); to search, which accounts have an organization record (the network's relay); places by name (Photon, OpenStreetMap); map tiles (OpenFreeMap) |
| The site's own pages (`site/site.js`) | written after the build | nothing: what joblist is |
| The embed (`embed/`, `<joblist-jobs organization="acme.org">`) | organizations' own websites; jsDelivr and the site serve it | the organization's account, the same way |
| Lexicon publishing (`lexicons` workflow) | by hand, by the owner | the schemas in `lexicons/` |

## Pages

| Address | What it is |
|---|---|
| `/` | search (organizations and their open jobs, a domain opens its page; their places on a map); signed out: what joblist does in brief, with its picture, a link to `/about`, and to sign in; signed in: only its organization in brief (its pill, its open jobs, post a job) |
| `/signin` | sign in with an organization's domain as its handle; then its page |
| `/settings` | the account signed in here (its page), else to sign in; the language; the source code; sign out |
| `/settings/language` | the language, one tap each |
| `/about` | how it works: four ideas, each beside its picture (from Settings and the home) |
| `/{domain}` | an organization: its description, links, places and its open jobs' on a map, its open jobs. Its "⋯" menu: Share; its own account also Post a job, Edit, On your website, and sees its offers no longer shown and the steps until it has described itself and posted |
| `/{domain}/edit` | describe it, part by part (its own account): each part with what it says now |
| `/{domain}/edit/{part}` | one part: about (name, website, description), kind, tags, places (OpenStreetMap), links |
| `/{domain}/post` | post a job (its own account); on site or hybrid, where: the organization's places in a tap, or a new one (also added to its places) |
| `/{domain}/embed` | its jobs on a website: a frame or an element to paste (anyone) |
| `/job/{did}/{rkey}` | a job offer: its organization, where (on a map), how, where to apply; its "⋯" menu shares it, its own account's also edits or deletes it |
| `/job/{did}/{rkey}/edit` | change an offer, or show it longer (its own account) |
| `/embed/?organization=…` | the frame the embed snippet opens (`static/embed/`) |

Pages of an organization's own account (`OwnOnly`) ask anyone else to sign in as it.
`/signin`, `/settings`, `/settings/language` and `/about` are written as pages of their own (`site/site-pages.js`, not
indexed), so they answer 200.

## The code

- `src/lib/atproto.js`: reading atproto with `fetch` (a handle's account, its server, its
  handle confirmed both ways, its records, record keys).
- `src/lib/session.svelte.js`: signing in with OAuth, one account; writing to it.
- `src/lib/records.js`: what pages show of a record, what forms write.
- `src/lib/profile.js`: an organization's profile, a job offer.
- `src/lib/directory.svelte.js`: search: the organizations the relay knows, read from their accounts, matched.
- `src/lib/places.js`: places as records keep them; found by name (Photon).
- `src/lib/map/maplibre.js`: the globe, loaded only with a map.
- `src/service-worker.js`: removes the offline worker earlier versions installed.

## The contracts

| Contract | What | Where it is written |
|---|---|---|
| Records | `today.joblist.company` (an organization, keyed by its domain), `today.joblist.job` (a job offer), in their authors' own accounts | [lexicons/](../lexicons), [docs/lexicons.md](lexicons.md) |
| A job's address | `/job/{did}/{rkey}`, kept in its record's `url` when it has no other | `config.jobPost.page` |
| The embed | `<joblist-jobs organization="…" lang="…" limit="…">`, `/embed/?organization=…` | [embed/src/](../embed/src) |
