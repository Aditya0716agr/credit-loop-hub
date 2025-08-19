-- UPDATE CREDIT RULES: founder costs vs tester rewards, and signup bonus 20
create extension if not exists pgcrypto with schema public;

-- 1) Ensure helper function exists
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

-- 2) Signup bonus: 20 credits for new users
create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, credits_balance)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'New User'), 20)
  on conflict (id) do nothing;
  return new;
end; $$;

-- 3) BEFORE INSERT on test_requests: deduct founder cost and lock payout portion
create or replace function public.before_insert_test_requests()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  current_balance integer;
  per_reward integer;
  testers integer;
  founder_total integer;
  payout_total integer;
  size text;
begin
  if new.id is null then new.id := gen_random_uuid(); end if;

  -- Map size by time_required
  if new.time_required <= 10 then
    size := 'small';
    per_reward := 1;  -- tester reward
    testers := 3;     -- testers count
    founder_total := 15; -- founder posting cost
  elsif new.time_required > 10 and new.time_required <= 20 then
    size := 'medium';
    per_reward := 2;
    testers := 5;
    founder_total := 30;
  else
    size := 'large';
    per_reward := 3;
    testers := 10;
    founder_total := 60;
  end if;

  payout_total := per_reward * testers;

  -- Normalize incoming row to these values to keep system consistent
  new.reward := per_reward;
  new.max_testers := testers;
  new.locked_remaining := payout_total;

  select credits_balance into current_balance from public.profiles where id = new.owner_id for update;
  if current_balance is null then raise exception 'Profile not found for owner %', new.owner_id; end if;
  if current_balance < founder_total then
    raise exception 'Not enough credits to post this test (need %, have %)', founder_total, current_balance;
  end if;

  -- Deduct founder total, but only lock the payout portion
  update public.profiles
     set credits_balance = credits_balance - founder_total,
         credits_locked = credits_locked + payout_total
   where id = new.owner_id;

  -- Log single debit for full founder cost with breakdown metadata
  perform public.log_credit_tx(
    new.owner_id,
    founder_total,
    'debit',
    'post_test',
    new.id,
    null,
    jsonb_build_object(
      'title', new.title,
      'size', size,
      'max_testers', testers,
      'per_reward', per_reward,
      'payout_total', payout_total,
      'fee', founder_total - payout_total
    )
  );

  return new;
end; $$;

drop trigger if exists trg_before_insert_test_requests on public.test_requests;
create trigger trg_before_insert_test_requests
before insert on public.test_requests
for each row execute function public.before_insert_test_requests();


