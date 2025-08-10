-- BACKEND UPGRADE FOR BETA TESTING PLATFORM
-- 0) Ensure pgcrypto
create extension if not exists pgcrypto with schema public;

-- 1) Types (ensure exist)
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

-- 2) Profiles: add locked balance
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits_locked integer NOT NULL DEFAULT 0;

-- 3) Test requests: add max_testers, locked_remaining, deadline
ALTER TABLE public.test_requests
  ADD COLUMN IF NOT EXISTS max_testers integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS locked_remaining integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deadline timestamptz;

-- REPLICA IDENTITY for realtime
ALTER TABLE public.test_requests REPLICA IDENTITY FULL;
ALTER TABLE public.credit_transactions REPLICA IDENTITY FULL;

-- 4) Drop legacy feedbacks feature (replaced by submissions)
DROP TRIGGER IF EXISTS trg_after_update_feedbacks_transfer ON public.feedbacks;
DROP FUNCTION IF EXISTS public.after_update_feedbacks_transfer();
DROP POLICY IF EXISTS "Testers and owners can view feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Users can submit their feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Owners can update feedback status" ON public.feedbacks;
DROP TABLE IF EXISTS public.feedbacks;

-- 5) Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.test_requests(id) ON DELETE CASCADE,
  tester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  rating integer,
  status public.feedback_status NOT NULL DEFAULT 'submitted',
  ip_address text,
  device_fingerprint text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (test_id, tester_id)
);
CREATE INDEX IF NOT EXISTS idx_submissions_test ON public.submissions(test_id);
CREATE INDEX IF NOT EXISTS idx_submissions_tester ON public.submissions(tester_id);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions REPLICA IDENTITY FULL;

-- RLS for submissions
DROP POLICY IF EXISTS "View submissions by tester or owner" ON public.submissions;
CREATE POLICY "View submissions by tester or owner" ON public.submissions
  FOR SELECT USING (
    tester_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.test_requests tr WHERE tr.id = submissions.test_id AND tr.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tester can create submission" ON public.submissions;
CREATE POLICY "Tester can create submission" ON public.submissions
  FOR INSERT WITH CHECK (
    auth.uid() = tester_id AND
    EXISTS (
      SELECT 1 FROM public.test_requests tr
      WHERE tr.id = submissions.test_id
        AND tr.owner_id <> auth.uid()
        AND tr.status = 'active'
        AND tr.locked_remaining >= tr.reward -- ensure capacity
    )
  );

DROP POLICY IF EXISTS "Owner can update status" ON public.submissions;
CREATE POLICY "Owner can update status" ON public.submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.test_requests tr WHERE tr.id = submissions.test_id AND tr.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_requests tr WHERE tr.id = submissions.test_id AND tr.owner_id = auth.uid()
    )
  );

-- prevent testers from editing after submission (no policy for tester update)

-- 6) Updated timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS set_submissions_updated_at ON public.submissions;
CREATE TRIGGER set_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_test_requests_updated_at ON public.test_requests;
CREATE TRIGGER set_test_requests_updated_at
BEFORE UPDATE ON public.test_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7) Update post-test trigger to lock credits for all testers
CREATE OR REPLACE FUNCTION public.before_insert_test_requests()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE needed_total integer;
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

  -- Deduct available and move to locked
  UPDATE public.profiles
     SET credits_balance = credits_balance - needed_total,
         credits_locked = credits_locked + needed_total
   WHERE id = NEW.owner_id;

  NEW.locked_remaining := needed_total;

  PERFORM public.log_credit_tx(NEW.owner_id, needed_total, 'debit', 'post_test', NEW.id, NULL, jsonb_build_object('title', NEW.title, 'max_testers', NEW.max_testers));

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_before_insert_test_requests ON public.test_requests;
CREATE TRIGGER trg_before_insert_test_requests
BEFORE INSERT ON public.test_requests
FOR EACH ROW EXECUTE FUNCTION public.before_insert_test_requests();

-- 8) Handle submission approval/rejection atomic transfers
CREATE OR REPLACE FUNCTION public.after_update_submissions_transfer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _reward integer;
        _owner uuid;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  SELECT tr.reward, tr.owner_id INTO _reward, _owner FROM public.test_requests tr WHERE tr.id = NEW.test_id FOR UPDATE;
  IF _reward IS NULL THEN RAISE EXCEPTION 'Test not found for submission %', NEW.id; END IF;

  -- Lock remaining for the test row
  UPDATE public.test_requests SET locked_remaining = locked_remaining - _reward WHERE id = NEW.test_id AND locked_remaining >= _reward;
  IF NOT FOUND THEN RAISE EXCEPTION 'No locked credits remaining for this test'; END IF;

  -- Adjust owner's locked accordingly
  UPDATE public.profiles SET credits_locked = credits_locked - _reward WHERE id = _owner;

  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    -- Payout to tester
    UPDATE public.profiles SET credits_balance = credits_balance + _reward WHERE id = NEW.tester_id;
    PERFORM public.log_credit_tx(NEW.tester_id, _reward, 'credit', 'feedback_approved', NEW.test_id, NEW.id, '{}'::jsonb);
  ELSIF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' THEN
    -- Refund to owner
    UPDATE public.profiles SET credits_balance = credits_balance + _reward WHERE id = _owner;
    PERFORM public.log_credit_tx(_owner, _reward, 'credit', 'refund', NEW.test_id, NEW.id, jsonb_build_object('reason', 'rejected_submission'));
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_after_update_submissions_transfer ON public.submissions;
CREATE TRIGGER trg_after_update_submissions_transfer
AFTER UPDATE OF status ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.after_update_submissions_transfer();

-- 9) Refund remaining locks when test is closed or deleted
CREATE OR REPLACE FUNCTION public.after_update_test_requests_refund_on_close()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid; _remaining integer;
BEGIN
  IF NEW.status = 'closed' AND OLD.status IS DISTINCT FROM 'closed' THEN
    _owner := NEW.owner_id; _remaining := NEW.locked_remaining;
    IF _remaining > 0 THEN
      UPDATE public.profiles SET credits_balance = credits_balance + _remaining, credits_locked = credits_locked - _remaining WHERE id = _owner;
      PERFORM public.log_credit_tx(_owner, _remaining, 'credit', 'refund', NEW.id, NULL, jsonb_build_object('reason','test_closed'));
      UPDATE public.test_requests SET locked_remaining = 0 WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_after_update_test_requests_refund_on_close ON public.test_requests;
CREATE TRIGGER trg_after_update_test_requests_refund_on_close
AFTER UPDATE OF status ON public.test_requests
FOR EACH ROW EXECUTE FUNCTION public.after_update_test_requests_refund_on_close();

CREATE OR REPLACE FUNCTION public.before_delete_test_requests_refund()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid; _remaining integer;
BEGIN
  _owner := OLD.owner_id; _remaining := OLD.locked_remaining;
  IF _remaining > 0 THEN
    UPDATE public.profiles SET credits_balance = credits_balance + _remaining, credits_locked = credits_locked - _remaining WHERE id = _owner;
    PERFORM public.log_credit_tx(_owner, _remaining, 'credit', 'refund', OLD.id, NULL, jsonb_build_object('reason','test_deleted'));
  END IF;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS trg_before_delete_test_requests_refund ON public.test_requests;
CREATE TRIGGER trg_before_delete_test_requests_refund
BEFORE DELETE ON public.test_requests
FOR EACH ROW EXECUTE FUNCTION public.before_delete_test_requests_refund();

-- 10) Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- helper to create notification
CREATE OR REPLACE FUNCTION public.notify(_user_id uuid, _type text, _payload jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(user_id, type, payload) VALUES (_user_id, _type, coalesce(_payload,'{}'::jsonb));
END; $$;

-- triggers to send notifications
CREATE OR REPLACE FUNCTION public.after_insert_submission_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  SELECT owner_id INTO _owner FROM public.test_requests WHERE id = NEW.test_id;
  PERFORM public.notify(_owner, 'new_submission', jsonb_build_object('test_id', NEW.test_id, 'submission_id', NEW.id));
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_after_insert_submission_notify ON public.submissions;
CREATE TRIGGER trg_after_insert_submission_notify
AFTER INSERT ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.after_insert_submission_notify();

CREATE OR REPLACE FUNCTION public.after_update_submission_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    PERFORM public.notify(NEW.tester_id, 'submission_' || NEW.status, jsonb_build_object('test_id', NEW.test_id, 'submission_id', NEW.id));
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_after_update_submission_notify ON public.submissions;
CREATE TRIGGER trg_after_update_submission_notify
AFTER UPDATE OF status ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.after_update_submission_notify();

-- 11) Leaderboard view (weekly)
CREATE OR REPLACE VIEW public.leaderboard_weekly AS
SELECT ct.user_id AS tester_id,
       sum(ct.amount)::int AS credits_earned,
       min(ct.created_at) AS first_earn,
       max(ct.created_at) AS last_earn
FROM public.credit_transactions ct
WHERE ct.direction = 'credit'::public.tx_direction
  AND ct.reason = 'feedback_approved'::public.tx_reason
  AND ct.created_at >= now() - interval '7 days'
GROUP BY ct.user_id
ORDER BY credits_earned DESC;

-- 12) Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View own badges" ON public.user_badges;
CREATE POLICY "View own badges" ON public.user_badges FOR SELECT USING (user_id = auth.uid());

-- seed simple badges
INSERT INTO public.badges(id, name, description) VALUES
  ('ten_tests_posted','10 Tests Posted','Posted 10 tests'),
  ('fifty_approvals_received','50 Approvals','Received 50 approved submissions')
ON CONFLICT (id) DO NOTHING;

-- award badge for 10 tests posted
CREATE OR REPLACE FUNCTION public.after_insert_test_requests_award_badge()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cnt int;
BEGIN
  SELECT count(*) INTO cnt FROM public.test_requests WHERE owner_id = NEW.owner_id;
  IF cnt >= 10 THEN
    INSERT INTO public.user_badges(user_id, badge_id)
    VALUES (NEW.owner_id, 'ten_tests_posted')
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_after_insert_test_requests_award_badge ON public.test_requests;
CREATE TRIGGER trg_after_insert_test_requests_award_badge
AFTER INSERT ON public.test_requests FOR EACH ROW EXECUTE FUNCTION public.after_insert_test_requests_award_badge();

-- award badge for 50 approvals received as tester
CREATE OR REPLACE FUNCTION public.after_update_submission_award_badge()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cnt int;
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    SELECT count(*) INTO cnt FROM public.submissions WHERE tester_id = NEW.tester_id AND status = 'approved';
    IF cnt >= 50 THEN
      INSERT INTO public.user_badges(user_id, badge_id)
      VALUES (NEW.tester_id, 'fifty_approvals_received')
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_after_update_submission_award_badge ON public.submissions;
CREATE TRIGGER trg_after_update_submission_award_badge
AFTER UPDATE OF status ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.after_update_submission_award_badge();

-- 13) Add tables to realtime publication
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.test_requests, public.submissions, public.notifications, public.credit_transactions, public.user_badges, public.profiles;
  EXCEPTION WHEN undefined_object THEN NULL; -- publication might not exist locally
  END;
END $$;
