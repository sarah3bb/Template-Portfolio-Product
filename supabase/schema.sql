-- ============================================================
-- Portfolio Builder Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Profiles table (auto-created for every new user)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Portfolios table (one portfolio per user — enforced by unique constraint on user_id)
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  slug text unique not null,
  published boolean default true,

  -- Basics
  company_name text,
  company_logos jsonb default '[]',
  first_name text,
  last_name text,
  job_title text,
  email text,
  phone text,
  city text,
  location text,

  -- Media
  profile_image_url text,
  background_image_url text,
  resume_url text,

  -- Content
  about_me text,
  university text,
  education jsonb default '[]',
  experience jsonb default '[]',
  hobbies jsonb default '[]',
  interests jsonb default '[]',
  social_links jsonb default '[]',
  typewriter_text jsonb default '[]',
  categories jsonb default '[]',
  achievements jsonb default '[]',
  projects jsonb default '[]',

  -- Contact form
  emailjs_service_id text,
  emailjs_template_id text,
  emailjs_public_key text,

  -- Theme
  theme jsonb default '{}',

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;

-- Profiles: users can only see and edit their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Portfolios: anyone can read published portfolios (public portfolio page)
create policy "portfolios_select_published" on public.portfolios
  for select using (published = true);

-- Portfolios: logged-in users can always read their own (even if unpublished)
create policy "portfolios_select_own" on public.portfolios
  for select using (auth.uid() = user_id);

-- Portfolios: users can create only their own
create policy "portfolios_insert_own" on public.portfolios
  for insert with check (auth.uid() = user_id);

-- Portfolios: users can update only their own
create policy "portfolios_update_own" on public.portfolios
  for update using (auth.uid() = user_id);

-- Portfolios: users can delete only their own
create policy "portfolios_delete_own" on public.portfolios
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage bucket: portfolio-assets
-- Run these in the Storage section OR via SQL
-- ============================================================

-- Create the bucket (if not already created via the Supabase dashboard)
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

-- Storage RLS: users can upload/manage only their own folder
create policy "storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'portfolio-assets' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage_select_own" on storage.objects
  for select using (
    bucket_id = 'portfolio-assets' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage_update_own" on storage.objects
  for update using (
    bucket_id = 'portfolio-assets' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'portfolio-assets' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Public can read all files in the bucket (so portfolio images are visible)
create policy "storage_public_read" on storage.objects
  for select using (bucket_id = 'portfolio-assets');
