# Nector Mini
Nector Mini — open-source code from Nector designed for developers to build and extend escrow-powered applications, with ready-to-use web and keeper bots

## Overview
Nector Mini is an open-source developer toolkit that enables anyone to build and extend escrow-powered applications on top of Nector.

It provides ready-to-use implementations for both web interfaces and Keeper bot, allowing developers to seamlessly embed escrow functionality into their own platforms, communities, or workflows.

Built on top of the Nector smart contract, Nector Mini abstracts complex escrow logic into simple, composable components — so developers can focus on building user experiences instead of reinventing trust systems.

## Core Features
### Easy Integration
- Plug-and-play escrow functionality
- Designed for rapid integration into existing apps
### Web Implementation
- Ready-to-use frontend components
- Built with modern frameworks (Next.js + TypeScript)
- Easily customizable UI
### Keeper Timeout Bot
- Trigger timeout
### Smart Contract Powered
- Built on top of Nector’s production smart contract
- Deterministic state machine ensures predictable behavior
### Built-in Escrow Logic
- Funding, shipping, review, dispute, and timeout flows included
- No need to implement escrow logic from scratch
### Trustless & Non-Custodial
- No centralized control over funds
- Fully enforced by on-chain logic
### Modular & Extensible
- Clean architecture for easy customization
- Extend or modify flows based on your use case
### Open Source & Transparent
- Fully auditable code
- Designed for developers who value transparency

## Getting Started
```
# Clone project:
git clone https://github.com/p33mTheRealOne/nector-mini

cd nector-mini

# Install dependencies:
yarn
```

Create a project in https://supabase.com/
Run this in SQL Editor:
```
-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- CONTACTS
-- =========================================================
create table if not exists public.contacts (
  owner_id uuid not null,
  contact_id uuid not null,
  created_at timestamptz not null default now(),
  nickname text null,

  constraint contacts_pkey primary key (owner_id, contact_id),
  constraint contacts_contact_id_fkey
    foreign key (contact_id) references auth.users (id) on delete cascade,
  constraint contacts_owner_id_fkey
    foreign key (owner_id) references auth.users (id) on delete cascade,
  constraint contacts_no_self check (owner_id <> contact_id)
);

create index if not exists contacts_owner_idx
  on public.contacts using btree (owner_id);

create index if not exists contacts_contact_idx
  on public.contacts using btree (contact_id);

alter table public.contacts enable row level security;

drop policy if exists "contacts_select_own" on public.contacts;
create policy "contacts_select_own"
on public.contacts
for select
to authenticated
using (
  auth.uid() = owner_id or auth.uid() = contact_id
);

drop policy if exists "contacts_insert_own" on public.contacts;
create policy "contacts_insert_own"
on public.contacts
for insert
to authenticated
with check (
  auth.uid() = owner_id
);

drop policy if exists "contacts_update_own" on public.contacts;
create policy "contacts_update_own"
on public.contacts
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "contacts_delete_own" on public.contacts;
create policy "contacts_delete_own"
on public.contacts
for delete
to authenticated
using (auth.uid() = owner_id);

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id uuid not null,
  username text null,
  wallet_address text null,
  created_at timestamptz null default now(),

  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade
);

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_delete_self" on public.profiles;
create policy "profiles_delete_self"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

-- =========================================================
-- USERNAMES
-- =========================================================
create table if not exists public.usernames (
  username text not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),

  constraint usernames_pkey primary key (username),
  constraint usernames_user_id_key unique (user_id),
  constraint usernames_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade,
  constraint usernames_lowercase_check
    check (username = lower(username))
);

alter table public.usernames enable row level security;

drop policy if exists "usernames_select_authenticated" on public.usernames;
create policy "usernames_select_authenticated"
on public.usernames
for select
to authenticated
using (true);

drop policy if exists "usernames_insert_self" on public.usernames;
create policy "usernames_insert_self"
on public.usernames
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "usernames_update_self" on public.usernames;
create policy "usernames_update_self"
on public.usernames
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "usernames_delete_self" on public.usernames;
create policy "usernames_delete_self"
on public.usernames
for delete
to authenticated
using (auth.uid() = user_id);

-- =========================================================
-- MESSAGES
-- =========================================================
create table if not exists public.messages (
  id uuid not null default gen_random_uuid(),
  conversation_id text not null,
  sender_id uuid not null,
  receiver_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz null,
  escrow_id text null,
  message_type text not null default 'text',

  constraint messages_pkey primary key (id),
  constraint messages_receiver_id_fkey
    foreign key (receiver_id) references auth.users (id) on delete cascade,
  constraint messages_sender_id_fkey
    foreign key (sender_id) references auth.users (id) on delete cascade,
  constraint messages_body_check
    check (char_length(body) >= 1 and char_length(body) <= 2000),
  constraint messages_sender_receiver_diff
    check (sender_id <> receiver_id),
  constraint messages_message_type_check
    check (
      message_type in ('text', 'image', 'escrow_update')
    )
);

create index if not exists messages_conversation_created_idx
  on public.messages using btree (conversation_id, created_at);

create index if not exists messages_receiver_created_idx
  on public.messages using btree (receiver_id, created_at);

create index if not exists messages_unread_idx
  on public.messages using btree (conversation_id, receiver_id, read_at);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
on public.messages
for select
to authenticated
using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender"
on public.messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
);

drop policy if exists "messages_update_receiver_or_sender" on public.messages;
create policy "messages_update_receiver_or_sender"
on public.messages
for update
to authenticated
using (
  auth.uid() = sender_id or auth.uid() = receiver_id
)
with check (
  auth.uid() = sender_id or auth.uid() = receiver_id
);

drop policy if exists "messages_delete_sender" on public.messages;
create policy "messages_delete_sender"
on public.messages
for delete
to authenticated
using (auth.uid() = sender_id);

-- =========================================================
-- ESCROW ORDERS
-- =========================================================
create table public.escrow_orders (
  id uuid not null default gen_random_uuid (),
  conversation_id text null,
  seller_id uuid null,
  seller_name text null,
  buyer_id uuid null,
  buyer_name text null,
  type text null,
  dispute_mode text null,
  description text null,
  price_usd numeric null,
  ship_date date null,
  ship_time_hours integer null,
  image_path text null,
  status text null default 'waiting_funding'::text,
  created_at timestamp without time zone null default now(),
  seller_wallet text null,
  buyer_wallet text null,
  tx_signature text null,
  escrow_pda text null,
  order_name text null,
  order_index smallint null,
  funded_tx text null,
  buyer_funded_tx text null,
  seller_funded_tx text null,
  seller_funded_at_unix text null,
  shipping_deadline text null,
  shipped_tx text null,
  shipped_at_unix text null,
  refund_tx text null,
  dispute_tx text null,
  seller_refund_tx text null,
  seller_respond_tx text null,
  confirm_tx text null,
  pay_seller_tx text null,
  delivery_file_path text null,
  delivery_file_name text null,
  delivery_file_size text null,
  dispute_opened_at_unix text null,
  seller_responded_at_unix text null,
  constraint escrow_orders_pkey primary key (id)
) TABLESPACE pg_default;

-- =========================================================
-- STORAGE BUCKETS
-- IMPORTANT:
-- Path:
-- 1) escrow bucket            => {user_id}/{escrow_pda}/{filename}
-- 2) digital-delivery bucket  => {escrow_pda}/{filename}
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'escrow',
  'escrow',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'digital-delivery',
  'digital-delivery',
  false,
  104857600,
  null
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =========================================================
-- STORAGE POLICIES : ESCROW
-- =========================================================

drop policy if exists "escrow_bucket_select_authenticated" on storage.objects;
create policy "escrow_bucket_select_authenticated"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'escrow'
);

drop policy if exists "escrow_bucket_insert_owner_folder" on storage.objects;
create policy "escrow_bucket_insert_owner_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'escrow'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "escrow_bucket_update_owner_folder" on storage.objects;
create policy "escrow_bucket_update_owner_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'escrow'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'escrow'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "escrow_bucket_delete_owner_folder" on storage.objects;
create policy "escrow_bucket_delete_owner_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'escrow'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================
-- STORAGE POLICIES : DIGITAL DELIVERY
-- IMPORTANT:
-- path: {escrow_pda}/{filename}
-- =========================================================

drop policy if exists "digital_delivery_select_participants" on storage.objects;
create policy "digital_delivery_select_participants"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'digital-delivery'
  and exists (
    select 1
    from public.escrow_orders eo
    where eo.escrow_pda = (storage.foldername(name))[1]
      and (auth.uid() = eo.seller_id or auth.uid() = eo.buyer_id)
  )
);

drop policy if exists "digital_delivery_insert_seller_only" on storage.objects;
create policy "digital_delivery_insert_seller_only"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'digital-delivery'
  and exists (
    select 1
    from public.escrow_orders eo
    where eo.escrow_pda = (storage.foldername(name))[1]
      and auth.uid() = eo.seller_id
  )
);

drop policy if exists "digital_delivery_update_seller_only" on storage.objects;
create policy "digital_delivery_update_seller_only"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'digital-delivery'
  and exists (
    select 1
    from public.escrow_orders eo
    where eo.escrow_pda = (storage.foldername(name))[1]
      and auth.uid() = eo.seller_id
  )
)
with check (
  bucket_id = 'digital-delivery'
  and exists (
    select 1
    from public.escrow_orders eo
    where eo.escrow_pda = (storage.foldername(name))[1]
      and auth.uid() = eo.seller_id
  )
);

drop policy if exists "digital_delivery_delete_seller_only" on storage.objects;
create policy "digital_delivery_delete_seller_only"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'digital-delivery'
  and exists (
    select 1
    from public.escrow_orders eo
    where eo.escrow_pda = (storage.foldername(name))[1]
      and auth.uid() = eo.seller_id
  )
);

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.escrow_orders;
```

Create .env.local
Put this in the file:
```
NEXT_PUBLIC_SUPABASE_URL=https:// Your supabase url
NEXT_PUBLIC_SUPABASE_ANON_KEY=// Your supabase anon key

SUPABASE_SERVICE_ROLE_KEY=// Your supabase service role key
```

## Run
```
npm run dev
```
Go to:
http://localhost:3000

## Learn more:
https://nector.chat/docs
