create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('admin', 'editor', 'viewer');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year integer,
  duration text,
  subject text,
  category text,
  language text,
  source text,
  url text,
  thumbnail_url text,
  variants jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  pinned boolean not null default false,
  starred boolean not null default false,
  programme_support text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists media_title_idx on public.media using gin (to_tsvector('simple', coalesce(title, '')));
create index if not exists media_subject_idx on public.media (subject);
create index if not exists media_year_idx on public.media (year);
create index if not exists media_language_idx on public.media (language);
create index if not exists media_programme_support_idx on public.media (programme_support);
create index if not exists media_created_at_idx on public.media (created_at desc);
create index if not exists media_updated_at_idx on public.media (updated_at desc);
create index if not exists media_url_idx on public.media (url);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_media_updated_at on public.media;
create trigger set_media_updated_at
before update on public.media
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.current_role()
returns public.app_role
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'viewer'::public.app_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role() = 'admin'::public.app_role;
$$;

alter table public.media enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "public users can read media" on public.media;
create policy "public users can read media"
on public.media for select
to anon, authenticated
using (true);

drop policy if exists "editors and admins can create media" on public.media;
create policy "editors and admins can create media"
on public.media for insert
to authenticated
with check (public.current_role() in ('editor'::public.app_role, 'admin'::public.app_role));

drop policy if exists "editors and admins can update media" on public.media;
create policy "editors and admins can update media"
on public.media for update
to authenticated
using (public.current_role() in ('editor'::public.app_role, 'admin'::public.app_role))
with check (public.current_role() in ('editor'::public.app_role, 'admin'::public.app_role));

drop policy if exists "admins can delete media" on public.media;
create policy "admins can delete media"
on public.media for delete
to authenticated
using (public.is_admin());

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "admins can manage profiles" on public.profiles;
create policy "admins can manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- After creating your first user, run this once in the Supabase SQL editor:
-- update public.profiles set role = 'admin' where email = 'you@example.com';

-- Optional realtime support for instant shared-library refreshes.
alter publication supabase_realtime add table public.media;
