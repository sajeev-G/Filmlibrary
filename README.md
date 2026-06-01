# NOORA Health Film Repository

Shared media repository for Noora Health films and videos. The app is now a static Cloudflare Pages frontend backed by Supabase Auth, Postgres, and Row Level Security.

## Stack

- Frontend: Vite static app
- Hosting: Cloudflare Pages
- Backend: Supabase
- Auth: Supabase Google OAuth and email magic links
- Database table: `media`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill in:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Only use the anon key in the frontend. Never expose the Supabase service role key.

4. Start locally:

```bash
npm run dev
```

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run [supabase-schema.sql](./supabase-schema.sql).
4. Enable Auth providers:
   - Google OAuth
   - Email magic links
5. Create your first user by logging in.
6. Promote the first admin in SQL:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Roles are managed inside the app from the admin-only `Manage Users` button after the first admin is promoted in SQL:

- `admin`: add, edit, delete, import, export, manage users in `profiles`
- `editor`: add, edit, import, export
- `viewer`: search, filter, view, export

## Cloudflare Pages Deployment

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Cloudflare Pages environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Deploy from GitHub or upload the Vite build output. No server or Cloudflare Worker is required.

## Spreadsheet Format

Imports and exports use this CSV/Excel-compatible header format:

```text
Title, Primary URL, Primary Language, Main Category, Description, Duration (minutes), Year of Creation, Tags, Script Link, Internal Notes, Featured, Lang Link 1 - Language, Lang Link 1 - URL, Lang Link 2 - Language, Lang Link 2 - URL, Lang Link 3 - Language, Lang Link 3 - URL, Lang Link 4 - Language, Lang Link 4 - URL, Lang Link 5 - Language, Lang Link 5 - URL
```

Repeated rows with the same `Title` are grouped into one media card with language variants.

Main categories are:

- ANC
- PNC
- SNCU
- NCD
- TB
- Cardiac
- MCCS Vertical
- Programme support videos
- NON med videos

## JSON Backup

The app supports JSON export/import in addition to CSV. JSON is useful for full-fidelity backups.

## Migrating Old localStorage Data

If an old browser has local records, log in as an admin/editor and the app will offer to import the legacy browser data.

You can also export localStorage data to JSON from the browser, then run:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-localstorage-to-supabase.mjs export.json
```

Use the service role key only for local migration scripts. Do not put it in Cloudflare Pages.

## Notes

- `.xls` export is an Excel-compatible HTML workbook. CSV is preferred for exchange.
- RLS allows public read-only access and enforces viewer/editor/admin write permissions.
- Pagination is enabled for large libraries.
- Public read-only mode is available with `?public=1`.
- Shared repository updates sync through Supabase realtime when enabled.

## Deployment Guide

See [cloudflare-deploy.md](./cloudflare-deploy.md) for GitHub, Cloudflare Pages, environment variable, Supabase, and troubleshooting steps.
