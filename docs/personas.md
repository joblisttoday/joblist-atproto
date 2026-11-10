# Who joblist is for

Each kind of person who comes to joblist, what they come to do, what serves
them today and what is missing. New features start from one of them.

## Looking for work

### Near home
Wants a job they can reach by bike or on foot.
- **Today:** a search on the home leads to the explorer (/jobs), with the
  map; "Near me" with bike or walking minutes, a map area. On Me: saved
  searches, applied and hidden jobs, private named lists of jobs ("Dream
  jobs") and private lists of organizations, each at its own address
  (/me/searches, /me/lists/…), with a file to move them all.
- **Missing:** being told when a new job appears near them without opening
  the site; real bike routes (today: straight-line distance).

### Remote
Wants remote work they are allowed to take from their country.
- **Today:** "Remote" and "Remote from my country" chips.
- **Missing:** the countries a remote job accepts are only known when the
  board says them; nothing tells them about new ones.

### Watching, not searching
Has a job, looks now and then: wants the new jobs of their saved searches,
and nothing else.
- **Today:** the Me tab counts the new jobs of their searches, and so does
  the home; /me/searches shows them per search. Any search can be followed in a feed reader
  (`/feed/search.xml?q=…`), made from its address only: nothing is stored.
- **Missing:** browser notifications (they would need the searches stored
  on a server: not unless asked for).

### Company first
Knows where they want to work, or wants to find out who hires in a city or
field.
- **Today:** company pages with their jobs, lists of companies by city or
  field, the companies index, a page per city and per field (`/in/berlin`,
  `/field/design`), which is how search engines bring them here.
- **Missing:** knowing when an organization they follow opens a job,
  without a feed reader.

## Making joblist

### Curator
Makes lists of companies (a city, a field, their network), adds companies.
- **Today:** lists, private until made public (and sent as a link
  meanwhile), Add with a pasted link, versions anyone can edit.
- **Missing:** knowing which of their list's companies have new jobs, or a
  closed board to fix.

### Company
Wants its page right and its jobs shown.
- **Today:** with the Bluesky handle set to its domain, its company record
  and job posts are shown as its own, verified, with its Bluesky picture.
  Its page says how ("Is this your company?"), and "You manage this page"
  once signed in with the domain.
- **Missing:** recruiters posting for it.

### Project looking for contributors
A cooperative, a nonprofit, an open source project: wants people to work
with, paid or not.
- **Today:** its organization page, its jobs, its links; lists by need
  gather such organizations.
- **Missing:** its open tasks: for listed organizations whose code lives
  on Tangled (atproto), their issues, shown as ways to take part, not as
  jobs.

### Recruiter
Posts jobs for a company, or several.
- **Today:** posts show as "shared by @them", after the company's board.
- **Missing:** being named by the company, so their posts count as its own.

## Around joblist

### Another app, an AI assistant
Reads or writes the same records.
- **Today:** the `today.joblist.*` lexicons, published; the snapshot
  files, with one small JSON file per organization (linked from its page)
  and per list (`lists/plc/{id}/{rkey}.json`); Atom feeds for any search; `/llms.txt`, written at each build from
  `src/lib/data/agents.json`, the lexicons and docs/, with etiquette;
  WebMCP tools on the site.
- **Missing:** nothing asked for yet.

### Maintainer
Keeps the data healthy.
- **Today:** the crawler, the snapshot's health of each board, a blocklist.
- **Missing:** a public status page (boards that answer, closed or moved,
  jobs per board, last run), as vinyl-finder's `/status/`.
