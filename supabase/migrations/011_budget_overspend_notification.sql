-- Add 'budget_overspend' to notifications type check constraint
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'request_new','request_vote','request_approved','request_denied',
    'budget_add','budget_edit','budget_remove','budget_overspend'
  ));
