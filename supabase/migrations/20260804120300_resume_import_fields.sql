-- Structured resume sections that do not already have dedicated portfolio columns.
alter table public.portfolios
  add column if not exists skills jsonb not null default '[]'::jsonb,
  add column if not exists certifications jsonb not null default '[]'::jsonb,
  add column if not exists awards jsonb not null default '[]'::jsonb,
  add column if not exists languages jsonb not null default '[]'::jsonb,
  add column if not exists volunteering jsonb not null default '[]'::jsonb;
