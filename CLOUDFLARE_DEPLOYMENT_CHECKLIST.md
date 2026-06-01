# Cloudflare Pages Deployment Checklist

## Before Deployment
- Create Supabase project
- Run supabase-schema.sql
- Configure Google Auth in Supabase
- Verify VITE_SUPABASE_URL
- Verify VITE_SUPABASE_ANON_KEY

## Cloudflare Pages
- Connect GitHub repository
- Framework: Vite
- Build command: npm run build
- Output directory: dist

## Environment Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Post Deployment Tests
- Login
- Add Media
- Edit Media
- Delete Media
- CSV Import
- CSV Export
- Role Permissions
- Public Mode
