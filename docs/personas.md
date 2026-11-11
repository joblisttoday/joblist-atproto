# Who joblist is for

Each kind of person who comes to joblist, what they come to do, what serves
them today and what is missing. New features start from one of them.

## The journey

joblist is a notebook for a job hunt: the organizations someone cares about and
the searches they keep, private in their browser, with open jobs read straight
from where they hire. What people publish (organizations, jobs, on their own
atproto accounts) is a head start everyone can search, never a requirement:
the app works with none of it, offline, on any domain.

1. **Search** what joblist knows: jobs, organizations, cities, fields.
2. **Keep** organizations to watch, any link (a website, a job board, a social
   profile, a group): joblist shows their jobs when it can read them, else it is
   a bookmark to look at. And keep searches, with their new jobs.
3. **Share**, if they want: publish an organization they kept, so others find it.

## Looking for work

### Keeper
Starts from the places they would like to work, not from a search: a cooperative
they heard of, a studio's Instagram, a lab's website.
- **Today:** Keep any link (/me): an organization joblist knows shows its open
  jobs; another has a profile (/me/organization#url=…, and /company/{domain} for
  any domain) with what their browser finds: its Bluesky account when its domain
  is its handle, its job board's name and open jobs (read live, one board), where
  they are; "Suggest to joblist" opens the add form filled in with all of it.
  A Save on each organization's page and card.
- **Missing:** the new jobs of kept organizations counted like a search's; a
  browser extension that tells, on any site, whether joblist knows it and its
  jobs, and keeps it in one tap; a website's own name, links and board (websites
  do not answer browsers: the bookmarklet or an extension reads them in the page).

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
