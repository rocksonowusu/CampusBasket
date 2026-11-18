# Campus Basket: student grocery marketplace (MVP)

The team buys groceries wholesale from farmers and sells them to students at close to farm-gate prices.
Students reserve online, the team buys in one bulk run, and students collect on campus and pay at pickup.

## Run it

```bash
npm install
neon login && neon env pull   # writes DATABASE_URL / DATABASE_URL_UNPOOLED to .env.local
# add ADMIN_PASSCODE=... to .env.local
npm run db:migrate            # create/upgrade tables (direct connection)
npm run db:seed               # first time only: import data/*.json (skips rows that exist)
npm run dev                   # http://localhost:3000
```

## What's in the MVP

| Page | Who | What it does |
| --- | --- | --- |
| `/` | Students | This week's drop: categories, search, sort, our price vs market price, countdown to cutoff |
| Basket drawer | Students | Quantities, running "you're saving" total, kept in the browser |
| `/checkout` | Students | Name, phone, pickup point, pay-at-pickup method. No online payment yet |
| `/order/CB-XXXX` | Students | Pickup code ticket, status timeline, cancel (phone number must match) |
| `/track` | Students | Look up an order by code |
| `/admin` | Team | Overview (sell-through chart, takings, top items, orders needing action), **Orders**, **Products** (add / edit every field / upload photo / hide / delete, with a live shop preview), **Buying list** (what to buy per supplier, boxes broken into their contents, "Got it" ticks saved for the whole team, printable), **Suppliers** (farm contacts, phone, location, notes; products link to them) |

## How the weekly drop works

Set in `src/lib/config.ts`:

- `drop.cutoffWeekday` / `cutoffHour` / `cutoffLabel`: when orders close (default Thursday 8pm)
- `drop.pickupWeekday` / `pickupWindow`: pickup day (default Saturday 10am–2pm)
- `pickupPoints`, `paymentMethods`, `categories`, `store.currency` (default GH₵), support phone/WhatsApp

Each order is tagged with its pickup date, and the admin dashboard filters by that date.

## Data (Neon Postgres)

Everything lives in a Neon Postgres database (project linked in `.neon` / `neon.ts`, branch `production`).
All database access is in `src/lib/db.ts`, using `pg` (node-postgres) with one shared pool on the
**pooled** `DATABASE_URL`, read through `parseEnv` from `@neon/env`.

- Tables: `products`, `orders` (each order keeps a snapshot of its lines and prices), `uploads`
  (dashboard photos, served at `/api/uploads/...`), `schema_migrations`.
- Schema changes: add a new file in `db/migrations/` (e.g. `002_add_x.sql`) and run `npm run db:migrate`.
  Migrations use the **direct** `DATABASE_URL_UNPOOLED`. Test risky ones on a Neon branch first
  (`neon checkout dev --create`).
- Placing an order locks the product rows (`SELECT … FOR UPDATE`) in a transaction, so two students
  can't both buy the last item. Cancelling (by the student or the team) restocks in the same transaction.
- `data/products.json` and `data/orders.json` are no longer read by the app; they are only the source
  for `npm run db:seed`.

**Hosting:** the app keeps no local state, so it runs on any Node host. On Vercel, set `DATABASE_URL`
and `ADMIN_PASSCODE` in the project settings.

## Photos

Product and page photos are in `public/photos/`. They come from Wikimedia Commons and Openverse,
under CC0 / CC BY / CC BY-SA licences. Credits are listed in `public/photos/credits.json` and shown at `/credits`
(linked in the footer). Keep that page if you keep these photos.

To swap a product photo, open the team dashboard → Products → Edit → Upload photo, then remove the old
photo's entry from `credits.json`. Products without an `image` fall back
to their built-in illustration (`art`). Photos of your own produce at your own pickup table will always beat stock photos.

## Sensible next steps

1. Mobile Money payment (e.g. Paystack / Hubtel) so orders are paid up front
2. SMS or WhatsApp message when an order is "ready"
3. Student accounts + reorder last week's basket
4. Move uploaded photos from Postgres to object storage if there get to be many of them
