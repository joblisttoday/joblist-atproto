# Lexicons

joblist's record types are defined in [`lexicons/today/joblist/`](../lexicons/today/joblist):
`company`, `list`, `suggestion`, `job`, and `authFull` (an OAuth permission set).
Every field added since the first records is optional: older records stay valid,
and apps that do not know a field ignore it.

## Company keys

A company record's key is its domain, normalised the same way everywhere
(`toDomain` in [`src/lib/models/company.js`](../src/lib/models/company.js)):
the website's host name, lowercase, without `www.`, at most 253 characters
(a DNS name). `https://www.Example.org/jobs` is `example.org`. Other records
refer to a company by this key (`job.company`, `list.companies`,
`suggestion.company`), with the same limit.

## Job offers

Optional fields a poster (or another app) can add:

| Field | What |
|---|---|
| `salary` | `{min, max, currency, period}`: whole amounts (integers, not cents), an ISO 4217 currency (`EUR`), a period (`year`, `month`, `week`, `day`, `hour`); one of `min`/`max` at least |
| `status` | `open` (the default when missing), `filled` or `closed`: a filled or closed offer is no longer shown |
| `updatedAt` | when the poster last edited it |
| `applicantLocations` | countries applicants can work from, as ISO 3166-1 alpha-2 codes (`DE`, `FR`) |
| `langs` | languages the offer is written in (BCP-47 tags) |

## Ways to take part

A company record can say how else to take part, beyond its jobs:
`contribute`, at most 10 of `{kind, text, url}`, where `kind` is `work`
(contributors welcome), `volunteer`, `join` (become a member) or `fund`, with
a short `text` (200 graphemes) or a `url`, or both. Other kinds are allowed
by the lexicon and left out by joblist.

## Places

Company (and job) locations can say `countryCode` (ISO 3166-1 alpha-2)
alongside the country's name.

## Limits on read

Anyone can write any record: the lexicon's limits (lengths, numbers of tags,
links, places…) are applied to every record read, by the app and the indexer
([`src/lib/models/limits.js`](../src/lib/models/limits.js), which reads them
from the lexicon files). Free text past its limit is cut; a link, date or code
past its limit, a value of the wrong type or a field the lexicon does not have
is left out.

The indexer also bounds each account ([`indexer/caps.js`](../indexer/caps.js),
numbers in `limits` of [`config.json`](../src/lib/data/config.json)): at most
`perAccount` records of each type (200 companies, 50 lists, 50 jobs, live ones
first, 200 suggestions), and job boards read for at most `boardsPerAccount`
companies per author of the version shown and `boards` in all (companies' own
versions first). Accounts in `bots` are exempt. What is left out is logged.

## Publishing them (owner only)

atproto apps find a lexicon from its NSID: `today.joblist.*` is resolved by a
DNS TXT record on the authority domain, naming the account that publishes the
schemas, and each schema is a `com.atproto.lexicon.schema` record in that
account, with the NSID as its record key.

1. Add the DNS record (once):

   ```
   _lexicon.joblist.today  TXT  "did=did:plc:jqaucxlucukeif3bltpuc7zx"
   ```

   The DID is `lexicons.did` in [`config.json`](../src/lib/data/config.json):
   the joblist.today account.

2. Publish the schemas, by hand only, when the owner decides: Actions →
   lexicons → Run with "write" ticked (`.github/workflows/lexicons.yml`, with
   that account's app password in the `JOBLIST_*` secrets; only changed
   schemas are written), or from a terminal; without `--write` it only says
   what it would write:

   ```sh
   node scripts/publish-lexicons.js
   JOBLIST_HANDLE=joblist.today JOBLIST_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
     node scripts/publish-lexicons.js --write
   ```

   It writes one record per file of `lexicons/`
   (`at://did:plc:jqaucxlucukeif3bltpuc7zx/com.atproto.lexicon.schema/today.joblist.job`, …),
   and refuses to write from any other account.

## OAuth permission set (later)

Today the app asks for each collection (`repo:today.joblist.company …` in
[`static/client-metadata.json`](../static/client-metadata.json)).
[`authFull.json`](../lexicons/today/joblist/authFull.json) groups them as one
permission set, which the sign-in screen can show as one readable line
("joblist: describe companies, make lists…"). Once it is published (above) and
resolves, the scope can become `atproto include:today.joblist.authFull`, in
both `client-metadata.json` and `src/lib/auth/client.js`. Until then, keep the
per-collection scopes: an unresolvable permission set fails sign-in.
