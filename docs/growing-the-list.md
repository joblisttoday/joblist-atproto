# Growing the company list

How the list of companies can grow and stay correct without the owner
curating it by hand. Numbers are from 19 October 2026.

## Where we are

The network holds **959 company records, all written by one account**
(joblisttoday.bsky.social), imported from the old hand-maintained data.
`scripts/check-companies.js` checked every one of them:

| | count | |
|---|---:|---|
| Website answers | 491 | of 569 with a website |
| Website refuses robots (403, 429) | 61 | exists, blocks our User-Agent |
| Website gone (no DNS, TLS, 404, parked) | 17 | |
| Website moved to another domain | 59 | rebrands and acquisitions |
| No website at all | 390 | old slug-keyed records |
| Job board **live, with jobs** | 277 | 26,683 open jobs |
| Job board live, **empty** | 88 | 47 of them Workable: accounts outlive their use |
| Job board **dead** (404) | 276 | 43 % of the 643 boards |
| Careers page only | 288 | 182 answer, 78 are 404 or unreachable |

Dead boards by provider: Greenhouse 126 of 304, Lever 83 of 134,
Personio 28 of 52, SmartRecruiters 15 of 32, Recruitee 14 of 31,
Workable 5 of 65, Ashby 4 of 23. Most "dead" companies are alive: they
moved to another provider (Greenhouse and Lever to Ashby, mostly).

So the first problem is not size, it is decay. A hand-curated mapping
loses about half its job boards over a few years.

## 1. Keep what we have alive (do first)

**Repair.** `scripts/repair-companies.js` reads the health report, looks
for job board links on each company's website and careers page, checks
every board it finds live, and proposes changes (dry run by default).
On the current data:

- **77 new job boards** with high confidence (52 replace a dead board,
  6 an empty one, the rest upgrade a careers page to a board the app can
  read), bringing **2,756 open jobs** back. 11 more with low confidence.
- **200 websites** for the 390 companies that had none (high
  confidence), 10 more low.
- **11 companies likely gone** (website, board and careers page all
  dead), **88 that need a person** (no website known and nothing answers),
  **54 whose website now redirects** to another domain.

Precision, checked by hand on random samples:

- New boards, high confidence: **20 of 20 correct**.
- Websites, high confidence: **25 of 25 the right company** (2 have
  since rebranded, the domain is still theirs).
- New boards, low confidence (all 11): 2 correct, 8 point to the company
  that bought or renamed it (Stackbit → Netlify, Savedo → Raisin,
  Exscientia → Recursion…), 1 wrong (KKR → a board called "stage").
  Low confidence means "a person decides": rename, mark acquired, or skip.
- Likely gone (all 11): 6 match public reports of a shutdown or
  acquisition (Arrival, Takeoff, Coya, Liefery, Lacework, Alpine Immune),
  1 is probably a broken TLS setup on a live company (Ziegert), 4 not
  verified.

`--write` applies only high-confidence changes to records of the signed-in
account and never deletes. Run it once, after a look at the dry run.

**Weekly health check, for free.** Built: the crawler
([crawler.md](crawler.md)) runs the health check and the repair every
week on GitHub Actions, keeps its report on the `crawl` branch and
publishes it at `/snapshot/crawl/health.json`. With its own account's
secrets it also writes its high-confidence repairs, as its own versions.

**Re-key old records.** The 390 slug-keyed records cannot be claimed by
their company (a company's own record is keyed by its domain). Once the
repair gives them a website, a one-off migration should create the record
under the domain, update the lists that point to the slug, and delete the
slug record. That needs care with lists; do it as its own step.

## 2. Let the network add companies

The app already lets anyone write a company record; these make it happen
without the owner:

1. **Companies register themselves.** A record written by an account
   whose handle is the company's domain is shown as verified and wins over
   other versions. **69 of the 547 domain-keyed companies already have a
   Bluesky account on their domain** (Anthropic, GitLab, Sentry, Figma,
   Discord, Monzo, Proton…). A "This is my company" button on a company
   page, shown when the signed-in handle equals the record key, makes
   claiming one click. Verified records are also the only ones that never
   need repair from outside: the company keeps its own board id current.
2. **Curators add companies while building lists.** Making a list is the
   reason to come; adding a missing company should happen inside that flow
   (paste a careers or board URL, the app recognizes the provider and id
   with `src/lib/ats/detect.js`, checks the board live, and fills the
   form).
3. **Hiring posts as suggestions.** Domain-verified Bluesky accounts post
   about hiring (about 37 distinct employers a week). Those are companies
   that are hiring now and whose identity is proven by their handle. Show
   them as "suggested companies" to curators, or prefill a draft record;
   a person still publishes it.

## 3. Open sources: look up, do not import

- **Open Jobs** (elliottdehn/open-jobs, CC0) stopped on 10 October 2026.
  Its code is still on GitHub, and `slugs.json` in the repository lists the
  boards its crawler ran on 8 September 2026: **75,660 live and 38,646
  gone**, across 36 providers. **24,956 live boards are on the 8 providers
  joblist reads** (Workable 6,818, Greenhouse 5,473, Personio 3,453,
  Ashby 3,048, Recruitee 2,603, Lever 2,203, SmartRecruiters 1,358). It
  holds 334 of our boards as live and 166 as gone. The 31 GB data export
  linked from its README answered HTTP 500 today, so treat `slugs.json`
  (2.5 MB, in git) as what survives.
- **Common Crawl** indexes pages on job board hosts
  (`jobs.ashbyhq.com/*`, `boards.greenhouse.io/*`, …), which gives board
  ids too. Its index API timed out when tried today; it is a batch job,
  not something to run often.

Use these as a **lookup**, not a source of records: when someone adds a
company, suggest the board id; when a board dies, look for the company's
name among known live boards. Records are still written by people.

## What not to do

- **Do not mass-import the 25,000 (or 75,000) boards.** It would make the
  list 26 times bigger overnight, all written by one account, with no
  description, place or tags: nothing a person chose. Lists and search would
  drown in companies nobody vouched for. They would also decay: Open Jobs
  itself had 34 % of its boards gone, and our own data lost 43 %. Every
  imported board is maintenance with no curator behind it.
- It would also break loading: the app reads 20 pages of 100 records per
  account (`limits.pagesPerRepo`), so one account past 2,000 records is
  cut off, and every visitor would download all of them.
- **Do not auto-delete.** "Likely gone" is a guess (1 in 11 wrong in the
  sample). Mark, do not remove; the author decides.
- **Do not fight the companies.** Never overwrite a verified record from
  outside, and keep the health check's User-Agent and timeouts polite.

## Showing health in the app

The records stay the source of truth; health is a hint next to them.

- Load `health.json` if present (one fetch, cached like the network);
  without it, the app works as today.
- On a company: "Job board not responding (checked 12 Oct)" when the
  board is dead, "No open jobs right now" when it is empty, "Website
  moved to x.com" when it redirects. A "last checked" date always.
- In lists and search: a muted state for companies whose board is dead,
  sorted after live ones; never hidden.
- For the record's author: a "Fix" link to the edit form with the
  repair's proposal prefilled, and "Is this still a company?" for the
  likely-gone ones.
- A verified badge for records written by the company itself, and a
  "This is my company" call to action when the viewer's handle matches.

## In order

1. Run the repair with `--write` (260 high-confidence changes), then the
   check again: the crawler does it weekly once its account's secrets are
   set.
2. Done: the weekly health check (the crawler) and a closed board shown on
   the organization's page (`gone` in its snapshot file).
3. Done: claiming for domain-handle accounts, and board URL recognition in
   the add-company form (`src/lib/ats/detect.js`).
4. To do: re-key the slug records that now have a website.
5. Done: companies from hiring posts and the Open Jobs board list (the
   crawler adds those with a live board linked from their own website, see
   [crawler.md](crawler.md)).
