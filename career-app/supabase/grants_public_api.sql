-- Supabase Data API grants for public schema.
-- Run in Supabase SQL editor after creating tables.
--
-- Why:
-- Supabase is changing defaults so new public-schema tables are not exposed
-- to PostgREST/GraphQL/supabase-js unless explicit GRANT is present.

-- Existing tables used by this app:
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.resumes to authenticated, service_role;
grant select, insert, update, delete on table public.jobs to authenticated, service_role;

-- Optional read-only access for anon (enable only if needed):
-- grant select on table public.resumes to anon;
-- grant select on table public.jobs to anon;

-- If tables use identity/serial columns, grant sequence access:
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Future-proof: apply same grants to new objects in public schema.
alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated, service_role;

alter default privileges in schema public
grant usage, select on sequences to authenticated, service_role;

-- NOTE:
-- Keep Row Level Security (RLS) policies in place.
-- GRANT only exposes object-level permissions; RLS still controls row access.
