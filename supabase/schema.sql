-- =============================================================================
-- NomSou Services — Supabase schema
-- -----------------------------------------------------------------------------
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
-- It creates:
--   1. inquiries      — rows written by the contact form
--   2. project_views  — one row per case study, holding a view count
--   3. increment_project_view() — the only way the browser can change a count
--
-- Row level security is ON for both tables, so the public anon key can do
-- exactly what the site needs and nothing else. In particular, nobody can
-- read the inquiries you receive from the browser — only you, in the
-- Supabase dashboard.
-- =============================================================================


-- 1. CONTACT INQUIRIES --------------------------------------------------------

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  company     text check (char_length(company) <= 120),
  service     text check (char_length(service) <= 60),
  message     text not null check (char_length(message) between 10 and 2000),
  source_page text check (char_length(source_page) <= 200),
  handled     boolean not null default false
);

comment on table public.inquiries is 'Contact form submissions from nomsouservices.com';

alter table public.inquiries enable row level security;

-- Anyone may submit the form...
drop policy if exists "anon can submit an inquiry" on public.inquiries;
create policy "anon can submit an inquiry"
  on public.inquiries
  for insert
  to anon
  with check (true);

-- ...but nobody can read, edit, or delete them with the public key.
-- (You read them in the Supabase dashboard, or with a signed-in account.)


-- 2. PROJECT VIEW COUNTS ------------------------------------------------------

create table if not exists public.project_views (
  slug        text primary key,
  views       bigint not null default 0,
  updated_at  timestamptz not null default now()
);

comment on table public.project_views is 'One row per case study page, with a running view count';

alter table public.project_views enable row level security;

-- Anyone may read the counts (the number shown on the page)...
drop policy if exists "anyone can read view counts" on public.project_views;
create policy "anyone can read view counts"
  on public.project_views
  for select
  to anon
  using (true);

-- ...but there is deliberately no insert/update policy. The only way to
-- change a count is the function below, which runs with elevated rights.

-- Seed the four case studies.
insert into public.project_views (slug) values
  ('cornerstone-realty'),
  ('ridgeline-property'),
  ('fieldnote-provisions'),
  ('tallgrass-landscape')
on conflict (slug) do nothing;


-- 3. THE COUNTING FUNCTION ----------------------------------------------------

-- security definer = this function may update the table even though the
-- visitor's key may not. It only ever adds 1 to an existing, known slug.
create or replace function public.increment_project_view(project_slug text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total bigint;
begin
  update public.project_views
     set views = views + 1,
         updated_at = now()
   where slug = project_slug
  returning views into new_total;

  -- Unknown slug: do not create rows from the browser, just report zero.
  if new_total is null then
    return 0;
  end if;

  return new_total;
end;
$$;

revoke all on function public.increment_project_view(text) from public;
grant execute on function public.increment_project_view(text) to anon, authenticated;


-- 4. OPTIONAL: EMAIL YOURSELF ON A NEW INQUIRY --------------------------------
-- Supabase Database Webhooks (Database → Webhooks) can POST every new row in
-- public.inquiries to an email service or a Netlify function. No SQL needed —
-- point the webhook at your endpoint and select the "inquiries" table.
