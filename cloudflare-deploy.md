# Cloudflare Pages Deployment Guide

This app deploys as a static Vite frontend on Cloudflare Pages and connects directly to Supabase with the public anon key.

## 1. GitHub Setup

Repository:

```text
sajeev-G/Filmlibrary
```

Push these files to GitHub:

- `index.html`
- `styles.css`
- `app.js`
- `supabase-service.js`
- `package.json`
- `supabase-schema.sql`
- `.env.example`
- `README.md`
- `scripts/migrate-localstorage-to-supabase.mjs`

Do not commit `.env`.

## 2. Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase-schema.sql`.
4. Enable Authentication providers:
   - Email
   - Google
5. Add the Cloudflare production URL to Supabase Auth redirect URLs:

```text
https://your-cloudflare-pages-domain.pages.dev
https://your-custom-domain.example
```

6. Log in once through the app.
7. Promote the first admin:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

## 3. Cloudflare Pages Setup

1. Go to Cloudflare Dashboard.
2. Open Workers & Pages.
3. Create application.
4. Select Pages.
5. Connect GitHub.
6. Select `sajeev-G/Filmlibrary`.

Build settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

## 4. Environment Variables

In Cloudflare Pages → Settings → Environment variables, add:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Never add `SUPABASE_SERVICE_ROLE_KEY` to Cloudflare Pages.

## 5. Production Deployment

Every push to the selected GitHub branch deploys automatically.

Manual local build:

```bash
npm install
npm run build
```

Upload `dist` only if not using GitHub integration.

## 6. Public Read-Only Links

Use:

```text
https://your-domain.example/?public=1
```

Public mode hides login and editing controls. Supabase RLS allows anonymous read-only access only.

## 7. Troubleshooting

If the app shows no media:

- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Confirm `supabase-schema.sql` was run.
- Confirm RLS policies exist.
- Confirm the `media` table has rows.

If login fails:

- Check Supabase Auth providers.
- Check redirect URLs.
- Check Google OAuth client configuration.

If import fails:

- Confirm the CSV headers match the template.
- Use `Import Template` from the app.
- Confirm the logged-in user is `admin` or `editor`.

If delete or clear fails:

- Confirm the logged-in user role is `admin`.

If realtime sync does not work:

- Confirm `alter publication supabase_realtime add table public.media;` ran successfully.
- Enable realtime for the table in the Supabase dashboard if required.
