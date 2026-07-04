-- Anghkooey MVP schema (run in Supabase SQL editor)

create extension if not exists "pgcrypto";

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists boxes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  label text not null,
  qr_token text unique not null,
  location_hint text,
  raw_transcript text,
  last_touched timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists box_items (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references boxes(id) on delete cascade,
  name text not null,
  category text,
  created_at timestamptz default now()
);

create index if not exists idx_boxes_account on boxes(account_id);
create index if not exists idx_boxes_qr on boxes(qr_token);
create index if not exists idx_items_box on box_items(box_id);
create index if not exists idx_items_name on box_items using gin (to_tsvector('english', name));

-- Demo account + Box #14 (idempotent-ish: delete demo first if re-running)
insert into accounts (id, email, display_name)
values ('00000000-0000-4000-8000-000000000001', 'demo@anghkooey.app', 'Demo User')
on conflict (id) do nothing;

delete from box_items where box_id in (
  select id from boxes where qr_token = 'demo-box-14-canonical'
);
delete from boxes where qr_token = 'demo-box-14-canonical';

insert into boxes (account_id, label, qr_token, location_hint, raw_transcript, last_touched)
values (
  '00000000-0000-4000-8000-000000000001',
  'Box #14',
  'demo-box-14-canonical',
  'Top shelf, far right',
  'Old Canon camera body, two HDMI cables, the battery charger, my college hoodie, a paperback of Siddhartha, and a postcard from Sarah.',
  '2026-03-12T10:00:00Z'
)
returning id;

-- Run item inserts after box exists (see scripts/seed-demo.sql)
