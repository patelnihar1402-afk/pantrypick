-- Run this in Supabase: Project > SQL Editor > New query > paste > Run

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  serve_per_pack numeric not null default 1,
  cal numeric not null,
  protein numeric not null,
  sugar numeric not null,
  fibre numeric not null,
  sodium numeric not null,
  stars numeric not null,
  ingredients text not null,
  source text default 'manual entry',
  created_at timestamp with time zone default now()
);

-- Allow the app to read and insert products.
-- This is intentionally open for the MVP — tighten this once you add
-- user accounts, so random visitors can't spam your product table.
alter table products enable row level security;

create policy "Public read access"
  on products for select
  using (true);

create policy "Public insert access"
  on products for insert
  with check (true);
