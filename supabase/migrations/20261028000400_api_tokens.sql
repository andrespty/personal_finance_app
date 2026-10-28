-- Personal API tokens for iPhone Shortcuts. Only a SHA-256 hash is stored;
-- the token itself is shown once when it's created.

create table public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  token_hash text not null unique,
  -- First characters of the token, so people can tell tokens apart.
  token_prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index api_tokens_user_idx on public.api_tokens (user_id);

alter table public.api_tokens enable row level security;

create policy "Users read their API tokens"
  on public.api_tokens for select to authenticated
  using ((select auth.uid()) = user_id);

-- The hash never leaves the database.
grant select (id, name, token_prefix, created_at, last_used_at, revoked_at)
  on public.api_tokens to authenticated;

-- Creates a token and returns it. This is the only time it's visible.
create function public.create_api_token(name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  token text;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = 'insufficient_privilege';
  end if;
  if btrim(coalesce(name, '')) = '' then
    raise exception 'Give the token a name, like "iPhone".' using errcode = 'check_violation';
  end if;
  if (select count(*) from public.api_tokens t where t.user_id = uid and t.revoked_at is null) >= 10 then
    raise exception 'You can have up to 10 active tokens. Revoke one first.' using errcode = 'check_violation';
  end if;

  token := 'pfa_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.api_tokens (user_id, name, token_hash, token_prefix)
  values (uid, btrim(create_api_token.name), encode(extensions.digest(token, 'sha256'), 'hex'), left(token, 10));
  return token;
end;
$$;

create function public.revoke_api_token(token_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.api_tokens
  set revoked_at = now()
  where id = token_id and user_id = auth.uid() and revoked_at is null;
  if not found then
    raise exception 'Token not found.' using errcode = 'no_data_found';
  end if;
end;
$$;

revoke execute on function public.create_api_token, public.revoke_api_token from public, anon;
grant execute on function public.create_api_token, public.revoke_api_token to authenticated;
