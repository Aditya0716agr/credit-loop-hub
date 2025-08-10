-- Fix linter issues: enable RLS on badges and set view to security_invoker

-- Enable RLS on badges and add open select policy
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- Recreate leaderboard view with security_invoker (PG15+)
DROP VIEW IF EXISTS public.leaderboard_weekly;
CREATE VIEW public.leaderboard_weekly WITH (security_invoker=true) AS
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