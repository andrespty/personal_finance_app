-- /info returns category names in one list and each category's subcategory
-- names under its name, so a Shortcut can pick a category and then look up
-- its subcategories. Top-level names are unique per user (ignoring case).
create or replace function public.api_info(user_ref uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'accounts', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'alias', a.alias, 'type', a.type) order by a.created_at)
      from public.accounts a
      where a.user_id = user_ref and not a.archived and a.type <> 'credit_card'
    ), '[]'::jsonb),
    'cards', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'alias', a.alias, 'wallet_name', a.wallet_name) order by a.created_at)
      from public.accounts a
      where a.user_id = user_ref and not a.archived and a.type = 'credit_card'
    ), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(p.name order by lower(p.name))
      from public.categories p
      where p.user_id = user_ref and p.parent_id is null
    ), '[]'::jsonb),
    'subcategories', coalesce((
      select jsonb_object_agg(p.name, coalesce((
        select jsonb_agg(c.name order by lower(c.name))
        from public.categories c
        where c.parent_id = p.id
      ), '[]'::jsonb))
      from public.categories p
      where p.user_id = user_ref and p.parent_id is null
    ), '{}'::jsonb)
  );
$$;
