-- Guided setup.

-- onboarding_step is the last completed step; 10 means setup is finished.
comment on column public.profiles.onboarding_step is
  'Last completed guided-setup step: 0 = not started, 10 = finished.';

-- People who were already using the app before guided setup existed have
-- set things up by hand, so they skip it.
update public.profiles p
set onboarding_step = 10
where exists (select 1 from public.accounts a where a.user_id = p.user_id);

-- Creates categories and subcategories from the setup checklist in one call.
-- Input: [{"name": "Food", "children": ["Groceries", "Coffee"]}, ...]
-- Names that already exist (ignoring case) are reused, so retrying is safe.
create function public.add_categories(categories jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  item jsonb;
  child_name text;
  parent uuid;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = 'insufficient_privilege';
  end if;
  if jsonb_typeof(categories) <> 'array' then
    raise exception 'Categories must be a list.' using errcode = 'invalid_parameter_value';
  end if;

  for item in select value from jsonb_array_elements(categories) loop
    insert into public.categories (user_id, name)
    values (uid, btrim(item ->> 'name'))
    on conflict (user_id, parent_id, lower(name)) do nothing;

    select c.id into parent
    from public.categories c
    where c.user_id = uid and c.parent_id is null and lower(c.name) = lower(btrim(item ->> 'name'));

    for child_name in select value from jsonb_array_elements_text(coalesce(item -> 'children', '[]'::jsonb)) loop
      insert into public.categories (user_id, name, parent_id)
      values (uid, btrim(child_name), parent)
      on conflict (user_id, parent_id, lower(name)) do nothing;
    end loop;
  end loop;
end;
$$;

revoke execute on function public.add_categories from public, anon;
grant execute on function public.add_categories to authenticated;
