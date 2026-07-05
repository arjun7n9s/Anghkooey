-- Anghkooey: auth-linked schema + RLS

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.boxes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  qr_token text unique not null,
  location_hint text,
  raw_transcript text,
  last_touched timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.box_items (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references public.boxes(id) on delete cascade,
  name text not null,
  category text,
  created_at timestamptz default now()
);

create index if not exists idx_boxes_account on public.boxes(account_id);
create index if not exists idx_boxes_qr on public.boxes(qr_token);
create index if not exists idx_items_box on public.box_items(box_id);
create index if not exists idx_items_name on public.box_items using gin (to_tsvector('english', name));

alter table public.profiles enable row level security;
alter table public.boxes enable row level security;
alter table public.box_items enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "boxes_all_own" on public.boxes for all using (auth.uid() = account_id) with check (auth.uid() = account_id);

create policy "items_select_own" on public.box_items for select using (
  exists (select 1 from public.boxes b where b.id = box_id and b.account_id = auth.uid())
);
create policy "items_insert_own" on public.box_items for insert with check (
  exists (select 1 from public.boxes b where b.id = box_id and b.account_id = auth.uid())
);
create policy "items_delete_own" on public.box_items for delete using (
  exists (select 1 from public.boxes b where b.id = box_id and b.account_id = auth.uid())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
