-- Budget audit log: append-only activity log for budget changes

CREATE TABLE public.budget_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES budget_periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN (
    'update_planned', 'update_actual', 'update_income',
    'add_item', 'delete_item', 'rename_item'
  )),
  item_id UUID,  -- no FK so logs survive item deletion
  item_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-period queries ordered by time
CREATE INDEX idx_budget_audit_log_period_time
  ON budget_audit_log (period_id, created_at DESC);

-- Enable RLS
ALTER TABLE budget_audit_log ENABLE ROW LEVEL SECURITY;

-- SELECT: household members can view logs for their periods
CREATE POLICY "Members can view audit log"
  ON budget_audit_log FOR SELECT
  USING (
    period_id IN (
      SELECT id FROM budget_periods
      WHERE household_id IN (SELECT public.get_user_household_ids())
    )
  );

-- INSERT: household members can insert logs for their periods
CREATE POLICY "Members can insert audit log"
  ON budget_audit_log FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND period_id IN (
      SELECT id FROM budget_periods
      WHERE household_id IN (SELECT public.get_user_household_ids())
    )
  );

-- No UPDATE or DELETE policies — append-only
