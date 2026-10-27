-- Shared helpers. The private schema is not exposed through the Data API.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Keeps updated_at current on every row update.
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Every table in this app is private to its owner. Revoke the Data API
-- defaults so access is granted table by table in each migration.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
