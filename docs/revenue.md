# Revenue: featured jobs and support

joblist stays free: browsing, curating lists and posting jobs cost nothing.
Two optional ways to pay keep it running:

- **Featured jobs**: anyone (usually the employer) pays to show one job in a
  block labelled **"Featured · paid by the employer"** for 30 days.
- **Support joblist**: pay what you want, once, at `/support`.

Both use [Stripe Payment Links](https://docs.stripe.com/payment-links): Stripe
hosts the payment page, the receipt and refunds. joblist never sees cards,
names, emails or addresses.

Prices, days and links are configuration, in
[`src/lib/data/revenue.json`](../src/lib/data/revenue.json):

| Key | Default | |
|---|---|---|
| `currency` | `EUR` | the Payment Links' currency |
| `featured.price` | `49` | the featuring price, in whole units (the Worker checks a payment is at least that) |
| `featured.days` | `30` | days featured per payment (paying again adds as many) |
| `featured.maxPerBlock` | `3` | featured jobs shown at a time in a block |
| `featured.rotateMinutes` | `60` | when there are more, the next ones are shown after this long |
| `featured.intentDays` | `2` | how long the Worker remembers which job a coming payment is for |
| `featured.cacheSeconds` | `60` | how long `/api/featured` may be cached |
| `featured.paymentLink` | `""` | the featuring Payment Link; empty hides every "Feature" button |
| `support.paymentLink` | `""` | the support Payment Link; empty hides the support button and footer link |

## How featuring works

1. On a job's page ("Feature this job"), or on a company's page ("Feature a
   job", then pick one), the browser opens `/featured?…` for that job.
2. The job is identified by its record (`{kind: 'record', uri}`, a
   `today.joblist.job` at-uri) or, for a job board's job, by its link and
   company key (`{kind: 'board', url, company}`). Its **id** is the base64url
   SHA-256 of that key (43 letters, digits, `-`, `_`: what Stripe accepts as a
   `client_reference_id`).
3. "Pay" first sends `POST /api/featured/intent {id, job}`: the Worker checks
   the id is the job's hash and keeps `id → job` for 2 days.
4. The browser opens the Payment Link with `?client_reference_id=<id>`.
5. Stripe sends `checkout.session.completed` to `POST /api/stripe/webhook`.
   The Worker checks the `Stripe-Signature` (HMAC-SHA256 with the webhook
   secret, at most 5 minutes old), that the session is `paid`, in the right
   currency and for at least the price, and that the id is known. It then
   features the job for `days` more (counting each Checkout Session once).
6. Stripe sends the payer back to `/featured/thanks` (or `/support/thanks`).
7. Every job list reads `GET /api/featured` and shows, above the list, the
   featured jobs that are in it. Jobs no longer open (an expired offer, a job
   gone from its board) are not shown.

The Worker ([`src/worker/`](../src/worker)) is the only server code, and only
`/api/*` runs it (`assets.run_worker_first` in `wrangler.jsonc`); everything
else is the static app, as before.

## What is stored

In the KV namespace `FEATURED`, nothing about people:

| Key | Value | Expires |
|---|---|---|
| `intent:<id>` | the job: `{kind, uri}` or `{kind, url, company}` | after 2 days |
| `featured` | `[{id, job, until, paidAt}]`, public at `/api/featured` | ended jobs are dropped at the next payment |
| `paid:<checkout session id>` | `1`, so a payment Stripe sends twice counts once | after 7 days |

Stripe keeps what it needs for the payment (email for the receipt, card
details) under its own privacy policy; the Worker reads only the session's
status, amount, currency and `client_reference_id`, and stores none of the
rest.

## Why it does not change curation

The featured block is separate and labelled as paid. It shows only jobs that
are already in the list being viewed (a featured job never appears in a list
that does not include its company), and it changes nothing below it: list
membership, the order of companies and of jobs, suggestions and filters are
exactly the same with or without featuring. Lists stay chosen by people.

When more jobs are featured than fit (`maxPerBlock`), they take turns, in
order of payment, every `rotateMinutes`: every featured job is shown as often.

## One-time setup (maintainer)

With the [Stripe CLI](https://docs.stripe.com/stripe-cli) (`stripe login`
first; add `--live` for live mode once tested in test mode):

```sh
# Featuring: 49 EUR, once
stripe products create --name="Featured job on joblist (30 days)"
stripe prices create --product=<prod_…> --currency=eur --unit-amount=4900
stripe payment_links create \
  -d "line_items[0][price]=<price_…>" -d "line_items[0][quantity]=1" \
  -d "after_completion[type]=redirect" \
  -d "after_completion[redirect][url]=https://atproto.joblist.today/featured/thanks"

# Support: pay what you want
stripe products create --name="Support joblist"
stripe prices create --product=<prod_…> --currency=eur \
  -d "custom_unit_amount[enabled]=true" -d "custom_unit_amount[preset]=500" -d "custom_unit_amount[minimum]=100"
stripe payment_links create \
  -d "line_items[0][price]=<price_…>" -d "line_items[0][quantity]=1" \
  -d "after_completion[type]=redirect" \
  -d "after_completion[redirect][url]=https://atproto.joblist.today/support/thanks"

# The Worker's webhook
stripe webhook_endpoints create \
  --url=https://atproto.joblist.today/api/stripe/webhook \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=checkout.session.async_payment_succeeded"
```

Payment Links take `?client_reference_id=…` from their URL with no option to
set. The webhook endpoint's answer includes its `secret` (`whsec_…`).

Then on Cloudflare:

```sh
npx wrangler kv namespace create FEATURED     # put the printed id in wrangler.jsonc (kv_namespaces)
npx wrangler secret put STRIPE_WEBHOOK_SECRET # paste the whsec_… secret
```

Put both Payment Link URLs (`https://buy.stripe.com/…`) in
`src/lib/data/revenue.json`, then `npm run deploy`.

## Refunds

Refund in the Stripe Dashboard (Payments → the payment → Refund). The job's id
is the payment's `client_reference_id`. To stop featuring it early, remove it
from the `featured` list:

```sh
npx wrangler kv key get featured --binding FEATURED --remote > featured.json
# delete the item with that id, then:
npx wrangler kv key put featured --binding FEATURED --remote --path featured.json
```

## Local development and tests

- Without the Worker (`npm run dev`), `/api/featured` fails and nothing is
  featured; without a Payment Link, no "Feature" or "Support" button shows.
- `npm test` runs the Worker's tests with an in-memory KV
  ([`src/worker/memory-kv.js`](../src/worker/memory-kv.js)): signatures,
  intents and events.
- To try the whole flow: put test links in `revenue.json` (not committed),
  `npm run build`, `cp .dev.vars.example .dev.vars`, `npx wrangler dev`
  (local KV), then pay without Stripe:

  ```sh
  STRIPE_WEBHOOK_SECRET=whsec_local_test \
    node scripts/featured-webhook.js http://127.0.0.1:8787 <company> <job link>
  ```
