-- Fixing previous error: recreate policies without IF NOT EXISTS and make migration idempotent

-- 1) Extensions
create extension if not exists pgcrypto with schema public;

-- 2) Enums (idempotent via DO blocks)
DO $$ BEGIN
  CREATE TYPE public.project_type AS ENUM ('Website','App','Service Flow','Other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.test_status AS ENUM ('active','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.feedback_status AS ENUM ('submitted','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.tx_direction AS ENUM ('debit','credit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.tx_reason AS ENUM ('post_test','feedback_approved','purchase','refund','admin_adjust');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  skills text[],
  interests text[],
  credits_balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create table if not exists public.test_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type public.project_type not null,
  goals text,
  time_required integer not null check (time_required in (5,10,15,30)),
  reward integer not null check (reward >= 2),
  link text not null,
  nda boolean not null default false,
  status public.test_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_test_requests_owner on public.test_requests(owner_id);
alter table public.test_requests enable row level security;

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.test_requests(id) on delete cascade,
  tester_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  rating integer,
  status public.feedback_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_feedbacks_test on public.feedbacks(test_id);
create index if not exists idx_feedbacks_tester on public.feedbacks(tester_id);
alter table public.feedbacks enable row level security;

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  direction public.tx_direction not null,
  reason public.tx_reason not null,
  test_id uuid references public.test_requests(id) on delete set null,
  feedback_id uuid references public.feedbacks(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_credit_tx_user on public.credit_transactions(user_id);
alter table public.credit_transactions enable row level security;

-- 4) Policies (drop if exist then recreate)
-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- test_requests
DROP POLICY IF EXISTS "Anyone can view tests" ON public.test_requests;
CREATE POLICY "Anyone can view tests" ON public.test_requests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own tests" ON public.test_requests;
CREATE POLICY "Users can create their own tests" ON public.test_requests
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their own tests" ON public.test_requests;
CREATE POLICY "Owners can update their own tests" ON public.test_requests
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their own tests" ON public.test_requests;
CREATE POLICY "Owners can delete their own tests" ON public.test_requests
  FOR DELETE USING (auth.uid() = owner_id);

-- feedbacks
DROP POLICY IF EXISTS "Testers and owners can view feedbacks" ON public.feedbacks;
CREATE POLICY "Testers and owners can view feedbacks" ON public.feedbacks
  FOR SELECT USING (
    tester_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.test_requests tr WHERE tr.id = feedbacks.test_id AND tr.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can submit their feedback" ON public.feedbacks;
CREATE POLICY "Users can submit their feedback" ON public.feedbacks
  FOR INSERT WITH CHECK (auth.uid() = tester_id);

DROP POLICY IF EXISTS "Owners can update feedback status" ON public.feedbacks;
CREATE POLICY "Owners can update feedback status" ON public.feedbacks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.test_requests tr WHERE tr.id = feedbacks.test_id AND tr.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_requests tr WHERE tr.id = feedbacks.test_id AND tr.owner_id = auth.uid()
    )
  );

-- credit_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

-- 5) Functions and triggers
-- updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

DROP TRIGGER IF EXISTS set_test_requests_updated_at ON public.test_requests;
create trigger set_test_requests_updated_at before update on public.test_requests
for each row execute function public.set_updated_at();

DROP TRIGGER IF EXISTS set_feedbacks_updated_at ON public.feedbacks;
create trigger set_feedbacks_updated_at before update on public.feedbacks
for each row execute function public.set_updated_at();

-- log tx
create or replace function public.log_credit_tx(
  _user_id uuid,
  _amount integer,
  _direction public.tx_direction,
  _reason public.tx_reason,
  _test_id uuid default null,
  _feedback_id uuid default null,
  _metadata jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.credit_transactions(user_id, amount, direction, reason, test_id, feedback_id, metadata)
  values (_user_id, _amount, _direction, _reason, _test_id, _feedback_id, coalesce(_metadata, '{}'::jsonb));
end; $$;

-- adjust credits
create or replace function public.adjust_user_credits(_user_id uuid, _delta integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set credits_balance = credits_balance + _delta where id = _user_id;
  if not found then raise exception 'Profile not found for user %', _user_id; end if;
end; $$;

-- before insert on test_requests: deduct credits
create or replace function public.before_insert_test_requests()
returns trigger language plpgsql security definer set search_path = public as $$
declare current_balance integer;
begin
  if new.id is null then new.id := gen_random_uuid(); end if;
  if new.reward < 2 then raise exception 'Minimum reward is 2 credits'; end if;
  select credits_balance into current_balance from public.profiles where id = new.owner_id for update;
  if current_balance is null then raise exception 'Profile not found for owner %', new.owner_id; end if;
  if current_balance < new.reward then raise exception 'Not enough credits to post this test (need %, have %)', new.reward, current_balance; end if;
  update public.profiles set credits_balance = credits_balance - new.reward where id = new.owner_id;
  perform public.log_credit_tx(new.owner_id, new.reward, 'debit', 'post_test', new.id, null, jsonb_build_object('title', new.title));
  return new;
end; $$;

DROP TRIGGER IF EXISTS trg_before_insert_test_requests ON public.test_requests;
create trigger trg_before_insert_test_requests before insert on public.test_requests
for each row execute function public.before_insert_test_requests();

-- after update feedbacks: credit tester on approval
create or replace function public.after_update_feedbacks_transfer()
returns trigger language plpgsql security definer set search_path = public as $$
declare _reward integer;
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    select reward into _reward from public.test_requests where id = new.test_id;
    if _reward is null then raise exception 'Associated test not found for feedback %', new.id; end if;
    update public.profiles set credits_balance = credits_balance + _reward where id = new.tester_id;
    perform public.log_credit_tx(new.tester_id, _reward, 'credit', 'feedback_approved', new.test_id, new.id, '{}'::jsonb);
  end if;
  return new;
end; $$;

DROP TRIGGER IF EXISTS trg_after_update_feedbacks_transfer ON public.feedbacks;
create trigger trg_after_update_feedbacks_transfer after update of status on public.feedbacks
for each row execute function public.after_update_feedbacks_transfer();

-- create profile on new auth user (10 starter credits)
create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, credits_balance)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'New User'), 10)
  on conflict (id) do nothing;
  return new;
end; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_profile_for_new_user();
