# joblist

A tool for a job hunt, in the browser (https://joblist.today): it reads an organization's open jobs straight from its own job board and its Bluesky account, from any link; it keeps the organizations, searches and jobs someone saves in their own browser; and it lets an organization describe itself and post its jobs on atproto, from its own account. For people looking for work, and for projects looking for people to work with.

Objectives: people find work that feels right for them and for society; projects find great contributors; both on a phone, in a few taps.
Never: a list of organizations or jobs kept by joblist, a tracker, an ad network, a middleman for applications, a central database, a server of its own, a paid service, or a tool that contacts anyone on its own.
People: [docs/personas.md](docs/personas.md). Pieces and where they run: [docs/architecture.md](docs/architecture.md). Stage: alpha; usage is public on Umami (`analytics` in config).

Choices, on purpose:
- Static files on GitHub Pages, built on each push (`.github/workflows/pages.yml`, `npm run build:site`): the app runs in the browser (`ssr = false`), and `site/site.js` writes the site's own pages after the build, `404.html`, the sitemap, robots.txt, llms.txt, `CNAME` and `.nojekyll`.
- Any other address (an organization's `/{domain}`, a job's `/job/…`) gets `404.html` with status 404, on which the app starts and shows it: there is no list of them to write pages for.
- No index, no snapshot, no indexer, no Worker: what joblist shows is read by each person's browser, from the source.

## How it works

- An organization's page (`/{domain}`): its own atproto account (its handle is its domain), its `today.joblist.company` record and `today.joblist.job` offers read from its server when the page opens (`lookup` in `src/lib/network/network.svelte.js`); else what the browser finds of the domain (`src/lib/network/discover.js`: its Bluesky account, its job board), and its jobs read live from the board (`src/lib/ats/`).
- Saved organizations (`src/lib/network/kept.svelte.js`): links, names, tags and job boards, in this browser only. Their jobs (`src/lib/network/kept-jobs.svelte.js`) are read live from their boards, at most `config.kept.boardsPerVisit` a visit, kept `config.kept.refreshHours`: they make `/jobs`, the saved searches and their new jobs.
- The browser add-on (`extension/`) reads the website open (websites do not answer other sites), saves it with its board; the embed (`embed/`) shows a board's jobs on any website.
- Local-first: a service worker (`src/service-worker.js`) keeps the app, so it opens offline; IndexedDB keeps what was read and the outbox (`src/lib/network/outbox.svelte.js`), where a write that can't reach the person's server waits.
- Settings, limits, phrases and fields are data in [src/lib/data/](src/lib/data), interface text in [src/lib/i18n/locales/](src/lib/i18n/locales) (en, fr, de, es: every key in each).

## Commands

```sh
npm run dev -- --host 127.0.0.1   # sign-in works on 127.0.0.1, not localhost
npm run check                     # types
npm test                          # unit tests (app, site, scripts)
npm run test:e2e                  # quality gate on the built site (Playwright; reads live boards and Bluesky)
npm run build:site                # what GitHub Pages serves, in build/
```

## Easy to get wrong

- Be polite to every service: job boards, Bluesky, OpenStreetMap. Each browser asks a few boards at a time (`config.kept.boardsPerVisit`), keeps what it read (`config.kept.refreshHours`), and never asks about a site someone only visits (the add-on decides its button from what is saved).
- Measure before building: count with a few requests first, and say the numbers in the commit.
- Wrong is worse than unknown: a job's workplace, pay or place is shown only when its board or its text says it clearly.
- What a page shows (search, filters, view, open job) lives after the `#` ([src/lib/navigation/address.js](src/lib/navigation/address.js)); a different thing gets its own path.
- Only an organization describes itself, or posts its jobs: a `today.joblist.company` or `today.joblist.job` record counts only from the account whose handle is its domain (`countingVersions`, `mayDescribe` in `src/lib/models/company.js`). No one publishes about another organization; others keep it in their browser.
- Lexicons stay small and are the owner's call: propose a change to `lexicons/` and wait for a yes; publishing is by hand only (docs/lexicons.md). A published field can never be taken back.
- Look at UI changes at 390px and 1440px before committing; do not stop or reuse a dev server you did not start.
