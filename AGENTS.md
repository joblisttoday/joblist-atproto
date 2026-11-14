# joblist

One thing, one site (https://joblist.today): an organization's jobs on the open network.
Signed in with its own atproto account (its domain as its handle), an organization describes
itself and posts its jobs; they are kept in its own account. Anyone sees its page at
`/{domain}` and its jobs at `/job/{did}/{rkey}`; it shows them on its own website (the
embed). Not an ATS: applications go straight to it.

That is all it does, on purpose: sign in with atproto, describe your own organization, post
jobs, see your own or another's page, embed your jobs. No saved anything, one account at a
time, no job boards read, no search, no map, no add-on, no offline app.
Never: a list of organizations or jobs kept by joblist, a tracker, an ad network, a middleman
for applications, a central database, a server of its own, a paid service.
Pieces and where they run: [docs/architecture.md](docs/architecture.md). Stage: alpha;
usage is public on Umami (`analytics` in config).

Choices, on purpose:
- Static files on GitHub Pages, built on each push (`.github/workflows/pages.yml`, `npm run build:site`): the app runs in the browser (`ssr = false`), and `site/site.js` writes `404.html`, the sitemap, robots.txt, llms.txt, `CNAME` and `.nojekyll` after the build.
- Its pages: home `/`, `/signin`, `/settings`, an organization's `/{domain}` (where its own account describes it and posts its jobs) and `/job/{did}/{rkey}` ([docs/architecture.md](docs/architecture.md)).
- Any other address (`/{domain}`, `/job/…`) gets `404.html` with status 404, on which the app starts and shows it.
- What a page shows is read by each person's browser from the organization's own account (`src/lib/profile.js`).

## Commands

```sh
npm run dev -- --host 127.0.0.1   # sign-in works on 127.0.0.1, not localhost
npm run check                     # types
npm test                          # unit tests (app, site, scripts)
npm run test:e2e                  # on the built site (Playwright; reads live atproto accounts)
npm run build:site                # what GitHub Pages serves, in build/
npm run build:embed               # embed/dist, kept in the repository: after changing the embed or its texts
```

## Easy to get wrong

- Only an organization speaks for itself: a `today.joblist.company` or `today.joblist.job` record counts only from the account whose handle is its domain, confirmed both ways (`handleOf` in `src/lib/atproto.js`, `loadProfile` in `src/lib/profile.js`).
- A form writes over the record it edits: fields it does not show are kept (`src/lib/records.js`). A job's `url` keeps its joblist address (`/job/{did}/{rkey}`), so that address never moves.
- Lexicons stay small and are the owner's call: propose a change to `lexicons/` and wait for a yes; publishing is by hand only (docs/lexicons.md). A published field can never be taken back.
- Interface text is in [src/lib/i18n/locales/](src/lib/i18n/locales) (en, fr, de, es: every key in each); settings in `src/lib/data/config.json`.
- Look at UI changes at 390px and 1440px before committing; do not stop or reuse a dev server you did not start.
