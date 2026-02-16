-- Add completed flag and tracking to budget items (per-month checkoff)
ALTER TABLE public.budget_items
  ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN completed_by UUID REFERENCES auth.users(id),
  ADD COLUMN completed_at TIMESTAMPTZ;
