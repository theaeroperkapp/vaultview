-- Auto-generate chat message when a budget item is updated
CREATE OR REPLACE FUNCTION notify_budget_change()
RETURNS TRIGGER AS $$
DECLARE
  household UUID;
  updater_name TEXT;
BEGIN
  SELECT bp.household_id INTO household
  FROM budget_periods bp WHERE bp.id = NEW.period_id;

  SELECT display_name INTO updater_name
  FROM profiles WHERE id = NEW.updated_by;

  IF OLD.actual_amount IS DISTINCT FROM NEW.actual_amount THEN
    INSERT INTO messages (household_id, sender_id, content, message_type, metadata)
    VALUES (
      household,
      NEW.updated_by,
      COALESCE(updater_name, 'Someone') || ' updated ' || NEW.name || ' from $' ||
        COALESCE(OLD.actual_amount, 0) || ' to $' || NEW.actual_amount,
      'budget_alert',
      jsonb_build_object(
        'item_id', NEW.id,
        'item_name', NEW.name,
        'old_value', OLD.actual_amount,
        'new_value', NEW.actual_amount
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_budget_item_update
  AFTER UPDATE ON budget_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_budget_change();
