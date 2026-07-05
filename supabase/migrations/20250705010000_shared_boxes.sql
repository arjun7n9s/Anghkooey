-- Shared box access: owner can invite viewers by account id

alter table public.boxes
  add column if not exists shared_with uuid[] default '{}';

drop policy if exists "boxes_all_own" on public.boxes;
drop policy if exists "boxes_select_own_or_shared" on public.boxes;
drop policy if exists "boxes_update_own" on public.boxes;
drop policy if exists "boxes_insert_own" on public.boxes;
drop policy if exists "boxes_delete_own" on public.boxes;

create policy "boxes_select_own_or_shared" on public.boxes
  for select using (
    auth.uid() = account_id
    or auth.uid() = any (shared_with)
  );

create policy "boxes_update_own" on public.boxes
  for update using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

create policy "boxes_insert_own" on public.boxes
  for insert with check (auth.uid() = account_id);

create policy "boxes_delete_own" on public.boxes
  for delete using (auth.uid() = account_id);

drop policy if exists "items_select_own" on public.box_items;
drop policy if exists "items_select_own_or_shared" on public.box_items;

create policy "items_select_own_or_shared" on public.box_items
  for select using (
    exists (
      select 1 from public.boxes b
      where b.id = box_id
      and (auth.uid() = b.account_id or auth.uid() = any (b.shared_with))
    )
  );

create or replace function public.account_id_for_email(addr text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where lower(email) = lower(addr) limit 1;
$$;

revoke all on function public.account_id_for_email(text) from public;
grant execute on function public.account_id_for_email(text) to authenticated;
