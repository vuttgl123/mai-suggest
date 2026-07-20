# Owner Admin and Initial Catalogue Design

## Goal

Seed a small, curated, real starter catalogue directly into the empty Supabase
project, then give the owner a protected in-app surface to add and remove
catalogue records without using the Supabase dashboard.

## Initial Catalogue

The one-time seed creates three categories and nine published records. Every
record has a verified official website link and no remote image. The existing
Bordeaux placeholder intentionally renders where an image has not yet been
chosen; no stock or synthetic image is added.

Categories:

- `qua-tang-nho`: four product ideas from Maison Marou, Aesop, Diptyque and
  LEGO Botanicals.
- `hen-ho-de-nho`: L'Usine Eatery and Anantara Hoi An Resort.
- `chuyen-di-cho-hai`: The Vietage, Amanoi and Six Senses Ninh Van Bay.

The seed only proceeds when both `categories` and `items` have zero rows. It
uses a server-only secret from `.env.local`, prints counts only, and does not
read or log key values.

## Owner Admin

`/admin` is a server-rendered owner-only route. It reads managed categories and
items through existing DDD use cases, then passes serializable read models to a
single client-side management surface.

The surface supports:

- Create a category, with slug, description and sort order.
- Create a published or draft item, select its category, add optional image URL
  and one official source URL.
- Delete an item after a browser confirmation.
- Delete an empty category after a browser confirmation. Categories containing
  items show an explanatory disabled control instead.

Every write calls the already owner-authorized Server Actions. No client uses a
secret key and no migration, RLS policy or role escalation is introduced.

## Access and Failure Handling

- Anonymous visitors continue through the existing auth guard.
- Active members are redirected to `/access-denied`; Server Actions independently
  enforce the same owner check.
- Form validation errors and unexpected action failures are shown inline.
- A failed optional image URL leaves the live catalogue card’s existing fallback
  intact.

## Verification

- Run a read-only count before seeding.
- Run the seed once and re-read counts and slugs without printing records or
  credentials.
- The user runs TypeScript, production build, and browser QA for `/`, `/admin`
  and the admin create/delete flow. No automated tests are added at the user's
  request.
