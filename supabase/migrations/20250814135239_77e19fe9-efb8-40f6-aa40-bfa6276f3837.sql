-- Fix security warnings for functions with mutable search paths

-- Fix the update_form_response_count function
CREATE OR REPLACE FUNCTION public.update_form_response_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forms SET response_count = response_count + 1 WHERE id = NEW.form_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forms SET response_count = response_count - 1 WHERE id = OLD.form_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

-- Fix the award_form_response_credits function
CREATE OR REPLACE FUNCTION public.award_form_response_credits()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  form_credits integer;
BEGIN
  -- Get credits per response for this form
  SELECT credits_per_response INTO form_credits FROM public.forms WHERE id = NEW.form_id;
  
  -- Award credits if user is authenticated and credits > 0
  IF NEW.respondent_id IS NOT NULL AND form_credits > 0 THEN
    PERFORM public.adjust_user_credits(NEW.respondent_id, form_credits);
    PERFORM public.log_credit_tx(
      NEW.respondent_id, 
      form_credits, 
      'credit', 
      'form_response', 
      NULL, 
      NULL, 
      jsonb_build_object('form_id', NEW.form_id, 'response_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END; $$;