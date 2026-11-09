# joblist

Open jobs at organizations that hire, read straight from their own job boards, and lists of organizations curated by people on atproto (https://joblist.today). For people looking for work, and for projects looking for people to work with.

Objectives: people find work that feels right for them and for society; projects find great contributors; both on a phone, in a few taps.
Never: a tracker, an ad network, a middleman for applications, a central database, a paid service, or a tool that contacts anyone on its own.
People: [docs/personas.md](docs/personas.md). Stage: alpha, not announced to anyone yet; usage is public on Umami (`analytics` in config).

Follows https://hwww.gitlab.io/savoir/agents.md (local: ~/src/hwww/savoir). Exceptions, on purpose:
- spa-for-apps over sveltekit-static: the app runs in the browser (`ssr = false`); `indexer/prerender.js` writes each company, list and job page's HTML after the build, from the snapshot.
- no-soft-404: unknown addresses get `404.html` with status 404, on which the app still starts, because records written since the last build have no page yet.
- bun-by-default: npm, because Cloudflare Workers Builds and the GitHub workflows use it.

## How it works

- The source of truth is the network: `today.joblist.*` records in their authors' own accounts ([lexicons/](lexicons)).
- The indexer ([indexer/](indexer)) rebuilds a static snapshot every 6 hours (`.github/workflows/snapshot.yml`, schedule only) and publishes it to `joblisttoday/joblist-snapshot`. The app reads it; only the signed-in person's own records are read live.
- The site is static files on Cloudflare, built on each push (and after each snapshot, with the `SITE_DEPLOY_HOOK` secret). Only `/in`, `/field`, `/feed` and the places sitemap run code ([worker/](worker)).
- Local-first: a service worker (`src/service-worker.js`) keeps the app and the snapshot files it read, so it opens and searches offline; the network copy and the outbox live in IndexedDB (`src/lib/local/store.js`, idb-keyval). A write that can't reach the person's server waits in the outbox (`src/lib/network/outbox.svelte.js`) and is sent in order later; a refused one is shown in the menu (`/menu/outbox`).
- Settings, limits, phrases and fields are data in [src/lib/data/](src/lib/data), interface text in [src/lib/i18n/locales/](src/lib/i18n/locales) (en, fr, de, es: every key in each).

## Commands

```sh
npm run dev -- --host 127.0.0.1   # sign-in works on 127.0.0.1, not localhost
npm run check                     # types
npm test                          # unit tests (app, indexer, worker, scripts, bot)
npm run test:e2e                  # quality gate on the built site (Playwright)
npm run index                     # a snapshot locally (asks every job board: rarely)
gh workflow run snapshot          # a snapshot now, instead of waiting for the schedule
```

## Easy to get wrong

- Be polite to every service: job boards, GitHub, Bluesky, OpenStreetMap. Read each thing once and cache it (see `indexer/workplaces.js`), cap what a run asks (`config.limits`, `config.workplaces`), identify the indexer (`config.crawler.userAgent`).
- Never make a page download every job when it needs a few: one small file per company (`companies/{key}.json`, `indexer/company-files.js`), per city and field (`landing/`).
- Measure before building: count in the snapshot or with a few requests first, and say the numbers in the commit.
- Wrong is worse than unknown: a job's workplace, pay or place is shown only when its board or its text says it clearly.
- What a page shows (search, filters, view, open job) lives after the `#` ([src/lib/navigation/address.js](src/lib/navigation/address.js)); a different thing gets its own path.
- `config.json` is shared by the app, the indexer and the Worker.
- Look at UI changes at 390px and 1440px before committing; do not stop or reuse a dev server you did not start.
