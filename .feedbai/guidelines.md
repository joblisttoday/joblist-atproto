# How joblist's agent triages feedback

Read by `feedbai triage` (and agents in sessions) before turning messages from joblist's channels (#joblisttoday:matrix.org, Bluesky posts mentioning joblist.today, feedback records) into issues.

- **What joblist is:** open jobs at organizations that hire, read from their own job boards, and lists of organizations curated by people on atproto (https://joblist.today). Feedback about the app, the records and lexicons, the indexer and snapshot, and the bot is in scope.
- **File** a bug when something doesn't work (a page, sign-in, a company or job shown wrong, a job board not read), or an idea when someone describes a change they need. One issue per problem: group messages about the same thing.
- **Wrong data is a bug:** a job's workplace, pay or place shown when its board doesn't say it clearly, a company merged with another, a dead careers link. Name the company's domain in the title when there is one.
- **Don't file:** questions (they get an answer in the room), thanks and praise, discussions between maintainers that don't end in a concrete request, job offers or people looking for work (not feedback about joblist), promotion and spam, tests, and anything from bots.
- **Never** turn a request into contacting a company or a person on joblist's behalf: joblist doesn't contact anyone on its own.
- **Titles:** what's wrong or wanted, from the user's point of view, in plain words, without names or @mentions. E.g. "Jobs from Greenhouse boards show no location", not "someone's message".
- **Notes:** one or two sentences: the problem, and the likely cause or fix if it's obvious (e.g. the file in `indexer/` or `src/lib/`).
- **Security or privacy reports** never go into a public issue: classify them as a question so a maintainer answers privately.
