# joblist for Firefox

On any website, its button says at a glance: the organization's open jobs on joblist (a
number), ✓ when joblist knows it but it is not hiring, ★ when you saved it. Its popup says:

- whether this organization is on joblist, its open jobs and the newest of them;
- the job board it links to, and its social profiles (Bluesky, LinkedIn, Instagram…);

and lets you **save** it and **tag** it, in your browser only, or **suggest** it to joblist
(the add form, filled in with what the page says).

What you save is one list with joblist.today's "Your organizations": the add-on keeps its
changes and makes them on joblist.today the next time it is open in this browser (and copies
the site's list back). Nothing is sent anywhere.

The button decides from joblist's counts (`counts.json` of the snapshot: every domain joblist
knows and its open jobs), read at most every 6 hours: the sites you visit are never looked up
(the `tabs` permission is for reading the open tab's address, here). Opening the popup asks
for that organization's small file (`companies/{domain}.json`: its newest jobs) and whether its
domain is a Bluesky handle.

## Build and try

Each site build packs it (and so does `npm run dev`): **joblist.today/apps** has the download (`/apps/joblist-firefox.zip`)
and the steps to load it in Firefox as a temporary add-on (until it is signed by Mozilla,
release Firefox installs it only that way, until it restarts).

```sh
npm run build:extension        # extension/dist (the add-on) and static/apps/joblist-firefox.zip (it, packed)
```

Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → `extension/dist/manifest.json` (or the .zip).

Check and pack it for addons.mozilla.org (submitted by hand, from the owner's account):

```sh
npx web-ext lint -s extension/dist
npx web-ext build -s extension/dist
```

## Files

- `manifest.json`, `popup.html`, `popup.css`: copied as they are.
- `src/popup.js`: the popup; `src/background.js`: the button, at a glance (`src/counts.js`);
  `src/collect.js`: what is read in the page (run there alone);
  `src/store.js`: the add-on's copy of the list and its changes; `src/sync.js`: on joblist.today.
- Reading a page (`src/lib/models/page-read.js`), the glance (`src/lib/models/glance.js`),
  the list and its changes (`src/lib/models/kept.js`)
  and the social networks (`src/lib/data/socials.json`) are the app's, tested with it.
- Texts: the `extension.*` keys of `src/lib/i18n/locales/`.
