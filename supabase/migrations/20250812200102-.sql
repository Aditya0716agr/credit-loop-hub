-- Fix FK violation by moving credit log to AFTER INSERT and store bio from signup metadata

-- Update profile creation to include bio from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  insert into public.profiles (id, display_name, bio, credits_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'New User'),
    nullif(new.raw_user_meta_data ->> 'bio', ''),
    10
  )
  on conflict (id) do nothing;
  return new;
end; $$;

-- Replace BEFORE INSERT function to remove logging (avoids FK issues before row exists)
CREATE OR REPLACE FUNCTION public.before_insert_test_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  needed_total integer;
  current_balance integer;
BEGIN
  IF NEW.id IS NULL THEN NEW.id := gen_random_uuid(); END IF;
  IF NEW.reward < 2 THEN RAISE EXCEPTION 'Minimum reward is 2 credits'; END IF;
  IF NEW.max_testers < 1 THEN RAISE EXCEPTION 'max_testers must be at least 1'; END IF;
  needed_total := NEW.reward * NEW.max_testers;
  SELECT credits_balance INTO current_balance FROM public.profiles WHERE id = NEW.owner_id FOR UPDATE;
  IF current_balance IS NULL THEN RAISE EXCEPTION 'Profile not found for owner %', NEW.owner_id; END IF;
  IF current_balance < needed_total THEN
    RAISE EXCEPTION 'Not enough credits to post this test (need %, have %)', needed_total, current_balance;
  END IF;
  UPDATE public.profiles
    SET credits_balance = credits_balance - needed_total,
        credits_locked = credits_locked + needed_total
    WHERE id = NEW.owner_id;
  NEW.locked_remaining := needed_total;
  -- Removed logging here to avoid FK violation; will log in AFTER INSERT trigger
  RETURN NEW;
END; $$;

-- AFTER INSERT function to log debit now that test row exists
CREATE OR REPLACE FUNCTION public.after_insert_test_requests_log_debit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  needed_total integer;
BEGIN
  needed_total := NEW.reward * NEW.max_testers;
  PERFORM public.log_credit_tx(NEW.owner_id, needed_total, 'debit', 'post_test', NEW.id, NULL, jsonb_build_object('title', NEW.title, 'max_testers', NEW.max_testers));
  RETURN NEW;
END; $$;

-- Ensure triggers are set up correctly
DROP TRIGGER IF EXISTS before_insert_test_requests ON public.test_requests;
CREATE TRIGGER before_insert_test_requests
BEFORE INSERT ON public.test_requests
FOR EACH ROW
EXECUTE FUNCTION public.before_insert_test_requests();

DROP TRIGGER IF EXISTS after_insert_test_requests_log_debit ON public.test_requests;
CREATE TRIGGER after_insert_test_requests_log_debit
AFTER INSERT ON public.test_requests
FOR EACH ROW
EXECUTE FUNCTION public.after_insert_test_requests_log_debit();