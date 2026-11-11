# The crawler

A bot that keeps the company list healthy and adds companies people point
at, on its own, every week. It writes from **its own atproto account**, like
any other contributor: its versions are labelled "added by the crawler, not
checked by a person", and a person's version always wins.

```sh
node scripts/crawl.js                       # dry run: nothing is written
node scripts/crawl.js --limit 50 --out /tmp/crawl   # try it on 50 companies
CRAWLER_HANDLE=crawler.joblist.today CRAWLER_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
  node scripts/crawl.js --write             # write the crawler's versions
node --test 'scripts/**/*.test.js'          # the rules, unit tested
```

## What it does, in order

1. **Health check** of every company, on the version people see (the
   company's own, otherwise the most recently edited): does the website
   answer, does the job board answer and with how many jobs, does the
   careers page answer ([`scripts/lib/health.js`](../scripts/lib/health.js)).
2. **Repairs** ([`scripts/lib/repair.js`](../scripts/lib/repair.js)), for
   companies with no website, a board that is not live, or a website that
   moved:
   - a new job board for a dead or empty one, found in links on the
     company's website and careers page, checked live;
   - otherwise, a board from Open Jobs whose id is the company's name and
     whose page links back to the company's website;
   - a website for companies without one (from the careers page address,
     or a link on the board page carrying the company's name);
   - the new address of a website that moved to a registered domain with
     the same name (notion.so → notion.com, flyzipline.com → zipline.com).
     Not a country version (veepee.com → veepee.fr depends on where the
     crawler runs), not a page on a subdomain, and a move to another name
     (an acquisition) is only reported: a person decides.
   - "likely gone" and "needs a person" are reported, never acted on.
   - **companies on Bluesky without a job board**
     ([`scripts/lib/connect.js`](../scripts/lib/connect.js)): those of the
     snapshot's `bluesky.json` (their domain is their Bluesky handle) with
     no board and none found above. The handle is checked both ways
     (DNS or `/.well-known/atproto-did`, and the DID document, as in
     [`indexer/handles.js`](../indexer/handles.js)); then a board of Open
     Jobs carrying their name and linking back to their website, or, with
     no website yet, the same search as for a new company (below), which
     also gives the website. At most `bluesky.maxConnect` (30) a run.
3. **New companies**, only ones somebody already points at:
   - keys used in job records that have no company
     record ([`indexer/suggest.js`](../indexer/suggest.js));
   - Bluesky accounts **whose handle is their own domain** (acme.com, not
     acme.bsky.social nor another of `hostedHandles`), from public, read-only
     listings ([`scripts/lib/accounts.js`](../scripts/lib/accounts.js)):
     every account that posted about hiring (post search, `search.queries`),
     then at most `bluesky.maxAccounts` (40) more among the followers of
     `bluesky.followersOf` (joblist.today) and the profiles matching
     `bluesky.queries` (careers, jobs, hiring…). Each handle is checked both
     ways, as above; one that fails is reported, not looked at. Names in
     profiles are not used: the name comes from the company's website.

   A candidate becomes a company only with a **live job board** that is
   linked from its own website, or found in Open Jobs and linking back to
   its website, and whose id carries its name. Name from the account or the
   site, website, board; nothing invented.
4. **Writes** (with `--write` only): the crawler's own version of each
   company it repaired, and records for the new ones, in its own repository.

Every run saves two files (default `static/snapshot/crawl/`, set by
`crawler.out` or `--out`): `health.json` and `proposals.json`.

## Rules

[`scripts/lib/versions.js`](../scripts/lib/versions.js) and
[`scripts/lib/plan.js`](../scripts/lib/plan.js), unit tested:

- **The bot never wins over a person.** It never writes a company whose
  own account wrote a record; it skips a company whose shown version was
  edited by a person after the health check; and once a person edits a
  company after the crawler did, the crawler leaves that company alone
  for good.
- **Only the fields it repaired change.** Its version is a copy of the
  shown version with those fields fixed, `createdAt` (of its own record) and
  `updatedAt` set. No special marker: it is a normal company record; the
  label comes from its DID being listed in `bots` in `config.json`.
- **High confidence only.** Low-confidence proposals stay in
  `proposals.json` for a person.
- **Never deletes.** Not a record, not a field.
- **Order and caps.** New companies first (within their own cap), then
  repairs that bring a job board back, then websites. Caps (`crawler` in [`config.json`](../src/lib/data/config.json)):
  at most `maxWritesPerRun` (200) writes a run, of which at most
  `maxNewCompaniesPerRun` (25) new companies; written `batchSize` (50) at a
  time with `pauseSeconds` (10) between batches. Bluesky's PDS allows
  5,000 points an hour and 35,000 a day per account (a create costs 3, an
  update 2): a full run uses at most 600.
- `--write` refuses to run unless the signed-in account's DID is in `bots`,
  so the crawler's versions are always labelled.
- Polite reading: a User-Agent naming joblist, 15 s timeouts, 8 requests at
  a time (4 for the Bluesky steps).
- **Read only, nobody contacted.** The crawler never posts, mentions,
  replies, follows or sends a message or an email: it reads public
  listings and websites, and its only writes are company records in its
  own repository.

## Sources

| Source | What for | Reproducible |
|---|---|---|
| atproto relay + each author's PDS | every company and job record | yes, public |
| companies' websites and boards | health, links to their boards | the web at that moment |
| [Open Jobs](https://github.com/elliottdehn/open-jobs) `slugs.json` (CC0), pinned to commit `a6bb3ab` | board ids, as a lookup only | yes, pinned file |
| Bluesky post search (`app.bsky.feed.searchPosts`) | domain accounts hiring now | no, recent posts |
| Bluesky profile search and followers (`searchActors`, `getFollowers` on `public.api.bsky.app`) | domain accounts that may be companies | no, the network at that moment |
| the snapshot's `bluesky.json` | companies whose domain is their Bluesky handle | yes, public |
| DNS-over-HTTPS, `/.well-known/atproto-did`, plc.directory | handles checked both ways | the network at that moment |

The public AppView (`api.bsky.app`) answers post search without signing
in, but only the first page of each query (a cursor gets a 403, and
`public.api.bsky.app` refuses search). Signed in (a `--write` run), the
crawler reads `search.pages` pages of each query.

Open Jobs is **never** imported: of its 24,897 live boards on providers
joblist reads, only those whose id is the name of a company we already
know, and whose page links to that company's website, are used.

## Files it publishes

The workflow keeps each run's files on the `crawl` branch (one commit a
week: the history of what the crawler saw and did), and the snapshot
workflow publishes the last one at `/snapshot/crawl/`.

`/snapshot/crawl/health.json`, for "Job board not responding · checked 12 Oct":

```jsonc
{
  "checkedAt": "2026-10-19T12:00:00.000Z",
  "companies": {
    "acme.org": {                     // company key
      "version": "at://did:…/today.joblist.company/acme.org", // the version checked
      "website": "ok",                // ok | blocked | missing | error | unreachable | parked; absent: no website
      "movedTo": "acme.com",          // the website redirects to another domain
      "board": "dead",                // live | empty | dead | error | unsupported; absent: no board id
      "jobs": 0,                      // open jobs when the board answered
      "careers": "ok",                // careers page, same states as website
      "gone": true,                   // likely gone: website, board and careers page all dead
      "needsAPerson": true,           // no website and its board does not answer
      "proposal": { "jobBoard": { "provider": "ashby", "id": "acme" }, "confidence": "high" }
    }
  }
}
```

`blocked` means the site exists but refuses robots (403, 429): not broken.

`/snapshot/crawl/proposals.json`: `checkedAt`, `crawler` (DID), `summary`
(the numbers below), `writes` (what `--write` writes: `action`, `rkey`,
`value`, `kind` repair or new, `notes`), `skipped` (`key`, `reason`),
`repairs` (every proposal with its notes) and `discovery` (every candidate
and why it was or was not added).

## The crawler's account

The crawler is a normal Bluesky account, separate from the curated
joblist.today account, so its work is labelled and can be told apart.

1. Create an account at [bsky.app](https://bsky.app), with an email of
   the project. Handle first: anything.bsky.social.
2. Settings → Account → Handle → "I have my own domain":
   `crawler.joblist.today`. Add the DNS record it shows on joblist.today:
   `TXT _atproto.crawler.joblist.today "did=did:plc:…"`, then verify.
3. Settings → Privacy and security → App passwords → add one, named
   `crawler` (no access to direct messages).
4. Put its DID in `bots` in [`src/lib/data/config.json`](../src/lib/data/config.json).
5. In the GitHub repository, Settings → Secrets and variables → Actions:
   - `CRAWLER_HANDLE`: `crawler.joblist.today`
   - `CRAWLER_APP_PASSWORD`: the app password
   - `CRAWLER_SERVICE` (optional): the PDS, if not `https://bsky.social`
6. Actions → crawl → Run workflow, once, and read `proposals.json` on the
   `crawl` branch. It then runs every Monday at 04:23 UTC.

Without the secrets the workflow still runs as a dry run and publishes the
health report.

## Run your own

Nothing about the crawler is privileged. Anyone can run it from their own
account: fork the repository (or just run the script), set
`CRAWLER_HANDLE` and `CRAWLER_APP_PASSWORD` to your own account, and run
`node scripts/crawl.js --write`. Your versions land in your repository and
every app reading `today.joblist.company` sees them; an app labels them as
a bot's when it lists your DID in its `bots`. Several crawlers can run side
by side: each builds on the shown version (another crawler's included) and
none overrides a person.

## Cost

€0 a month. GitHub Actions is free for public repositories (and 2,000
minutes a month for private ones). A run takes about 6 minutes (959
companies: 2.5 for the health check, 2.5 for repairs, 0.5 for discovery;
about 350 MB of memory), once a week, so under 30 minutes a month; the snapshot it starts takes a few more. No
server, no database: the records stay in their authors' repositories, the
report on a git branch.

## Last dry run

19 October 2026, 959 companies (all from one account), 5 min 47 s:

| | |
|---|---:|
| Boards live / empty / dead | 276 / 89 / 277 (26,643 open jobs) |
| Companies looked at for repair | 738 |
| New job board, high confidence | 83 (6 of them from Open Jobs) |
| New website, high confidence | 220 (21 of them a moved domain) |
| Low confidence, left for a person | 18 |
| Likely gone / needs a person (reported only) | 11 / 88 |
| Hiring posts read / domain accounts / new with a live board | 799 / 64 / 1 |
| Keys in lists and suggestions without a record | 0 |
| **Writes planned** | **200** (1 new company, 199 repairs, all creates) |
| Deferred to next run (cap) | 79 |

Hand checks: the 6 Open Jobs boards (Wise, Uniswap, Proxima Fusion,
Perplexity, Gong, Duolingo) and the new company (Technopolis Group,
Personio) are right. Of the moved domains, the country versions
(veepee.fr, misterspex.de) and a portal page (portal.eurosky.tech) were
wrong and are now excluded; the 21 left are rebrands to the same name.
Earlier hand checks of the repair: boards 20 of 20, websites 25 of 25
([growing-the-list.md](growing-the-list.md)).

7 November 2026, discovery only (`--limit 20`, 77 s): 794 hiring posts
gave 61 domain accounts, the profile search 40 more (36 over the cap), 2
handles failed the check both ways; 1 new company with a live board
(greenhouse, linked from its website). The 28 companies on Bluesky
without a board (mostly atproto apps) have none to find yet.

Few new companies come from hiring posts: most domain accounts posting
"hiring" are job boards, newsrooms or people, and have no board linked
from their site. That is the point: the crawler adds only what it can
prove.
