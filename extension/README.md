# joblist for Firefox

On any website, the add-on says:

- whether this organization is on joblist, and how many jobs it has open;
- the job board it links to, and its social profiles (Bluesky, LinkedIn, Instagram…);

and lets you **save** it and **tag** it, in your browser only, or **suggest** it to joblist
(the add form, filled in with what the page says).

What you save is one list with joblist.today's "Your organizations": the add-on keeps its
changes and makes them on joblist.today the next time it is open in this browser (and copies
the site's list back). Nothing is sent anywhere. Asking whether joblist knows an organization
is one small file (`companies/{domain}.json` of the snapshot), only when you open the popup:
browsing is never looked up.

## Build and try

```sh
npm run build:extension        # writes extension/dist, the add-on
```

Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → `extension/dist/manifest.json`.

Check and pack it for addons.mozilla.org (submitted by hand, from the owner's account):

```sh
npx web-ext lint -s extension/dist
npx web-ext build -s extension/dist
```

## Files

- `manifest.json`, `popup.html`, `popup.css`: copied as they are.
- `src/popup.js`: the popup; `src/collect.js`: what is read in the page (run there alone);
  `src/store.js`: the add-on's copy of the list and its changes; `src/sync.js`: on joblist.today.
- Reading a page (`src/lib/models/page-read.js`), the list and its changes (`src/lib/models/kept.js`)
  and the social networks (`src/lib/data/socials.json`) are the app's, tested with it.
- Texts: the `extension.*` keys of `src/lib/i18n/locales/`.
