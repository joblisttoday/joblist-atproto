# Lexicons

joblist's record types are defined in [`lexicons/today/joblist/`](../lexicons/today/joblist):
`company`, `list`, `suggestion`, `job`, and `authFull` (an OAuth permission set).
joblist reads and writes `company` and `job` only (`collections` in config): `list` and
`suggestion` were published before, and their records stay valid, but joblist no longer
reads them.
A `company` or `job` record counts only from the organization's own account (its handle is
the record's domain): no one describes another organization.
Every field added since the first records is optional: older records stay valid,
and apps that do not know a field ignore it.

## Company keys

A company record's key is its domain, the account's own handle: lowercase, at most 253
characters (a DNS name); joblist reads it only from the account whose handle it is
(`loadProfile` in [`src/lib/profile.js`](../src/lib/profile.js)). Other records
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

## Places

Company (and job) locations can say `countryCode` (ISO 3166-1 alpha-2)
alongside the country's name.

## Limits on read

Anyone can write any record: joblist shows its text as text (never as HTML), follows its
links only when they are web links (and email, to apply), and shows a job offer only while
it is open and not past `expiresAt`, never further than `config.jobPost.maxDays` from now
([`src/lib/records.js`](../src/lib/records.js)).

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
