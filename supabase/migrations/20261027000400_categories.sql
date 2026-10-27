create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  parent_id uuid,
  name text not null check (char_length(name) between 1 and 40),
  icon text check (char_length(icon) <= 40),
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),
  foreign key (parent_id, user_id) references public.categories (id, user_id) on delete restrict,
  constraint not_own_parent check (parent_id <> id)
);

create unique index categories_user_parent_name_key
  on public.categories (user_id, parent_id, lower(name)) nulls not distinct;
create index categories_parent_id_idx on public.categories (parent_id);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function private.set_updated_at();

-- Categories are at most two levels deep: parent → subcategory.
create function private.enforce_category_depth()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is not null then
    if exists (select 1 from public.categories where id = new.parent_id and parent_id is not null) then
      raise exception 'A subcategory cannot have its own subcategories.'
        using errcode = 'check_violation';
    end if;
    if exists (select 1 from public.categories where parent_id = new.id) then
      raise exception 'A category with subcategories cannot become a subcategory.'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger categories_enforce_depth
  before insert or update of parent_id on public.categories
  for each row execute function private.enforce_category_depth();

alter table public.categories enable row level security;

create policy "Users manage their categories"
  on public.categories for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.categories to authenticated;
