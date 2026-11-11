# joblist for Firefox

On any website, its button shows ★ when you saved the organization. Its popup says:

- the job board the page links to, its open jobs and the newest of them (read from the board);
- its social profiles (Bluesky, LinkedIn, Instagram…);

and lets you **save** it (with its job board) and **tag** it, in your browser only, and open
its page on joblist.

What you save is one list with joblist.today's "Your organizations": the add-on keeps its
changes and makes them on joblist.today the next time it is open in this browser (and copies
the site's list back). Nothing is sent anywhere.

The button shows ★ on the website of an organization you saved, decided in the browser: the
sites you visit are never looked up (the `tabs` permission is for reading the open tab's
address, here). Opening the popup reads the page, then asks its job board for its open jobs
and Bluesky whether its domain is a handle.

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
