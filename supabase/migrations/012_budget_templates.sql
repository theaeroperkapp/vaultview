-- Budget Templates
CREATE TABLE public.budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_income NUMERIC(12,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budget_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.budget_templates(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planned_amount NUMERIC(12,2) DEFAULT 0,
  sort_order INT DEFAULT 0
);

-- RLS
ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view templates"
  ON public.budget_templates FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Members can insert templates"
  ON public.budget_templates FOR INSERT
  WITH CHECK (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Members can update templates"
  ON public.budget_templates FOR UPDATE
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Members can delete templates"
  ON public.budget_templates FOR DELETE
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Members can view template items"
  ON public.budget_template_items FOR SELECT
  USING (template_id IN (
    SELECT id FROM public.budget_templates
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

CREATE POLICY "Members can insert template items"
  ON public.budget_template_items FOR INSERT
  WITH CHECK (template_id IN (
    SELECT id FROM public.budget_templates
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

CREATE POLICY "Members can update template items"
  ON public.budget_template_items FOR UPDATE
  USING (template_id IN (
    SELECT id FROM public.budget_templates
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

CREATE POLICY "Members can delete template items"
  ON public.budget_template_items FOR DELETE
  USING (template_id IN (
    SELECT id FROM public.budget_templates
    WHERE household_id IN (SELECT get_user_household_ids())
  ));
