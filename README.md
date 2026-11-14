# joblist

An organization's jobs on the open network. Signed in with its own [atproto](https://atproto.com)
account (its domain as its handle), an organization describes itself and posts its jobs;
they stay in its own account. Anyone sees its page at `joblist.today/{domain}`, and it shows
its jobs on its own website with one line to paste. Applications go straight to it.

joblist keeps nothing of its own: it is static files, and everything is read by each
person's browser from the organization's account. Nobody can take a record down, rank it
or sell it, and any other app can read it.

## Records

Two record types, defined in [`lexicons/`](lexicons/today/joblist):

- **`today.joblist.company`**: one organization, keyed by its domain
  (`at://did:…/today.joblist.company/example.org`): name, website, description, kind, tags.
  joblist reads it only from the account whose handle is that domain, confirmed both ways.
- **`today.joblist.job`**: a job offer, in the organization's own account: title, its
  domain (`company`), description, place, workplace, employment, where to apply, `url` (its
  page elsewhere, or its joblist page `/job/{did}/{rkey}`) and `expiresAt`.

How keys work and how to publish the lexicons: [docs/lexicons.md](docs/lexicons.md).
Pages and code: [docs/architecture.md](docs/architecture.md).

## Develop

Node 24 (see `.nvmrc`) and npm 11.

```sh
npm install
npm run dev -- --host 127.0.0.1   # sign-in works on 127.0.0.1, not localhost
npm test
npm run check
npm run test:e2e                  # on the built site (Playwright)
npm run build:site                # what GitHub Pages serves, in build/
```

Settings are in [`src/lib/data/config.json`](src/lib/data/config.json), interface text in
[`src/lib/i18n/locales/`](src/lib/i18n/locales) (English, French, German, Spanish: every key in each).

The embed (`<joblist-jobs organization="acme.org">`, [`embed/src/`](embed/src/JoblistJobs.svelte)):
an organization's open jobs on its own site, read from its account by the visitor's
browser. Built to `embed/dist`, kept in the repository, so jsDelivr serves it from GitHub:
`https://cdn.jsdelivr.net/gh/joblisttoday/joblisttoday@<tag>/embed/dist/joblist-jobs.js`;
the site serves a copy at `/embed/joblist-jobs.js`. `npm run build:embed` after changing it
(a test says when it is out of date).

## Deploy

GitHub Pages, from the `pages` workflow on each push to `main` (Settings → Pages →
Source: GitHub Actions). The domain is the build's `CNAME` (joblist.today).
[`static/client-metadata.json`](static/client-metadata.json) must match the deployed origin.

Only the site's own scripts may run (`csp` in `vite.config.js`). The page view counter
(Umami) is a pinned copy served from the site, [`static/vendor/umami.js`](static/vendor/umami.js).

The `lexicons` workflow publishes the changed schemas, by hand, by the owner
([docs/lexicons.md](docs/lexicons.md)).

## License

Code: GPL-3.0-or-later. Records belong to their authors.
