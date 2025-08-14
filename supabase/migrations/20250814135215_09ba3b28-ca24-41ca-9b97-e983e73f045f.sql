-- Create Internal Forms feature tables

-- Forms table
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  test_id UUID, -- Optional link to test_requests
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'external', 'private')),
  branding JSONB DEFAULT '{}', -- colors, logo, etc.
  settings JSONB DEFAULT '{}', -- anonymous responses, etc.
  response_count INTEGER NOT NULL DEFAULT 0,
  credits_per_response INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Form questions table
CREATE TABLE public.form_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'short_answer', 'long_answer', 'rating', 'yes_no', 'email')),
  title TEXT NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  options JSONB DEFAULT '[]', -- for multiple choice
  validation JSONB DEFAULT '{}', -- min/max length, etc.
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Form responses table  
CREATE TABLE public.form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL,
  respondent_id UUID, -- null for anonymous responses
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Form response answers table
CREATE TABLE public.form_response_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer_text TEXT,
  answer_data JSONB DEFAULT '{}', -- for complex answers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_response_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Forms viewable by creator" ON public.forms
FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Forms insertable by authenticated users" ON public.forms
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Forms updatable by creator" ON public.forms
FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Forms deletable by creator" ON public.forms
FOR DELETE USING (creator_id = auth.uid());

-- Public view policy for active forms
CREATE POLICY "Active forms publicly viewable" ON public.forms
FOR SELECT USING (status = 'active' AND visibility IN ('internal', 'external'));

-- RLS Policies for form_questions
CREATE POLICY "Questions viewable by form creator" ON public.form_questions
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.forms WHERE id = form_questions.form_id AND creator_id = auth.uid()
));

CREATE POLICY "Questions insertable by form creator" ON public.form_questions
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.forms WHERE id = form_questions.form_id AND creator_id = auth.uid()
));

CREATE POLICY "Questions updatable by form creator" ON public.form_questions
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM public.forms WHERE id = form_questions.form_id AND creator_id = auth.uid()
));

CREATE POLICY "Questions deletable by form creator" ON public.form_questions
FOR DELETE USING (EXISTS (
  SELECT 1 FROM public.forms WHERE id = form_questions.form_id AND creator_id = auth.uid()
));

-- Public view policy for questions of active forms
CREATE POLICY "Questions publicly viewable for active forms" ON public.form_questions
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.forms WHERE id = form_questions.form_id AND status = 'active' AND visibility IN ('internal', 'external')
));

-- RLS Policies for form_responses
CREATE POLICY "Responses viewable by form creator" ON public.form_responses
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.forms WHERE id = form_responses.form_id AND creator_id = auth.uid()
));

CREATE POLICY "Responses insertable by authenticated users" ON public.form_responses
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.forms WHERE id = form_responses.form_id AND status = 'active'
));

-- Users can view their own responses
CREATE POLICY "Users can view own responses" ON public.form_responses
FOR SELECT USING (respondent_id = auth.uid());

-- RLS Policies for form_response_answers
CREATE POLICY "Answers viewable by form creator" ON public.form_response_answers
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.form_responses fr
  JOIN public.forms f ON f.id = fr.form_id
  WHERE fr.id = form_response_answers.response_id AND f.creator_id = auth.uid()
));

CREATE POLICY "Answers insertable with response" ON public.form_response_answers
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.form_responses fr
  JOIN public.forms f ON f.id = fr.form_id
  WHERE fr.id = form_response_answers.response_id AND f.status = 'active'
));

-- Users can view answers to their own responses
CREATE POLICY "Users can view own response answers" ON public.form_response_answers
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.form_responses WHERE id = form_response_answers.response_id AND respondent_id = auth.uid()
));

-- Add foreign key constraints
ALTER TABLE public.form_questions 
ADD CONSTRAINT form_questions_form_id_fkey 
FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

ALTER TABLE public.form_responses 
ADD CONSTRAINT form_responses_form_id_fkey 
FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

ALTER TABLE public.form_response_answers 
ADD CONSTRAINT form_response_answers_response_id_fkey 
FOREIGN KEY (response_id) REFERENCES public.form_responses(id) ON DELETE CASCADE;

ALTER TABLE public.form_response_answers 
ADD CONSTRAINT form_response_answers_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES public.form_questions(id) ON DELETE CASCADE;

-- Add optional foreign key to test_requests
ALTER TABLE public.forms 
ADD CONSTRAINT forms_test_id_fkey 
FOREIGN KEY (test_id) REFERENCES public.test_requests(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_forms_creator_id ON public.forms(creator_id);
CREATE INDEX idx_forms_status ON public.forms(status);
CREATE INDEX idx_form_questions_form_id ON public.form_questions(form_id);
CREATE INDEX idx_form_questions_order ON public.form_questions(form_id, order_index);
CREATE INDEX idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX idx_form_response_answers_response_id ON public.form_response_answers(response_id);
CREATE INDEX idx_form_response_answers_question_id ON public.form_response_answers(question_id);

-- Trigger to update form response count
CREATE OR REPLACE FUNCTION public.update_form_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forms SET response_count = response_count + 1 WHERE id = NEW.form_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forms SET response_count = response_count - 1 WHERE id = OLD.form_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER form_response_count_trigger
AFTER INSERT OR DELETE ON public.form_responses
FOR EACH ROW EXECUTE FUNCTION public.update_form_response_count();

-- Trigger to award credits for form responses
CREATE OR REPLACE FUNCTION public.award_form_response_credits()
RETURNS TRIGGER AS $$
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
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER award_form_response_credits_trigger
AFTER INSERT ON public.form_responses
FOR EACH ROW EXECUTE FUNCTION public.award_form_response_credits();

-- Add updated_at trigger for forms
CREATE TRIGGER update_forms_updated_at
BEFORE UPDATE ON public.forms
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();