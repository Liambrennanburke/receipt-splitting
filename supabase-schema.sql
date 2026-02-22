-- Run this in the Supabase SQL Editor to create the sessions table and storage bucket

create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  restaurant_name text,
  meal_date text,
  raw_ocr_text text,
  receipt_image_url text,
  items jsonb not null default '[]',
  people jsonb not null default '[]',
  tax numeric not null default 0,
  tip numeric not null default 0,
  split_mode text not null default 'proportional',
  person_totals jsonb not null default '[]',
  grand_total numeric not null default 0
);

-- Enable Row Level Security (service role key bypasses RLS)
alter table sessions enable row level security;

-- Storage bucket for receipt images
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false);

-- Allow service role to manage the receipts bucket
create policy "Service role can manage receipts"
on storage.objects for all
using (bucket_id = 'receipts')
with check (bucket_id = 'receipts');
