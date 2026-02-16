-- Seed data for January 2026
-- Run this after creating a household and user
-- Usage: SELECT seed_january_2026('household-uuid', 'user-uuid');

CREATE OR REPLACE FUNCTION seed_january_2026(p_household_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_period_id UUID;
  v_cat_fixed UUID;
  v_cat_subs UUID;
  v_cat_software UUID;
  v_cat_health UUID;
  v_cat_lifestyle UUID;
  v_cat_wedding UUID;
  v_cat_savings UUID;
  v_cat_allowance UUID;
BEGIN
  -- Create budget period
  INSERT INTO budget_periods (household_id, month, year, total_income)
  VALUES (p_household_id, 1, 2026, 8922.76)
  RETURNING id INTO v_period_id;

  -- Create categories
  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Fixed', 0, '#6366F1', 'lock') RETURNING id INTO v_cat_fixed;

  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Subscriptions', 1, '#8B5CF6', 'tv') RETURNING id INTO v_cat_subs;

  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Software', 2, '#3B82F6', 'code') RETURNING id INTO v_cat_software;

  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Health', 3, '#10B981', 'heart-pulse') RETURNING id INTO v_cat_health;

  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Lifestyle', 4, '#F59E0B', 'sparkles') RETURNING id INTO v_cat_lifestyle;

  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Wedding Expenses', 5, '#EC4899', 'gem') RETURNING id INTO v_cat_wedding;

  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Savings Vault', 6, '#14B8A6', 'vault') RETURNING id INTO v_cat_savings;

  INSERT INTO budget_categories (household_id, name, sort_order, color, icon)
  VALUES (p_household_id, 'Allowance', 7, '#F97316', 'wallet') RETURNING id INTO v_cat_allowance;

  -- Fixed items
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_fixed, 'Apartment + Electricity', 2550.00, 2550.00, 0, p_user_id),
    (v_period_id, v_cat_fixed, 'Internet', 88.12, 88.12, 1, p_user_id),
    (v_period_id, v_cat_fixed, 'Apartment Insurance', 18.25, 18.25, 2, p_user_id),
    (v_period_id, v_cat_fixed, 'Car Payment', 694.00, 1694.00, 3, p_user_id),
    (v_period_id, v_cat_fixed, 'Car Insurance', 259.62, 259.62, 4, p_user_id),
    (v_period_id, v_cat_fixed, 'Gas', 150.00, 150.00, 5, p_user_id),
    (v_period_id, v_cat_fixed, 'Food', 300.00, 300.00, 6, p_user_id),
    (v_period_id, v_cat_fixed, 'Phone', 267.39, 267.39, 7, p_user_id),
    (v_period_id, v_cat_fixed, 'Credit Card', 2200.00, 201.44, 8, p_user_id);

  -- Subscriptions
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_subs, 'Netflix', 10.56, 10.56, 0, p_user_id),
    (v_period_id, v_cat_subs, 'Amazon Prime Student', 8.25, 8.25, 1, p_user_id),
    (v_period_id, v_cat_subs, 'Apple Bundle', 38.41, 38.41, 2, p_user_id),
    (v_period_id, v_cat_subs, 'Disney + Hulu + ESPN', 29.52, 29.52, 3, p_user_id),
    (v_period_id, v_cat_subs, 'Cinemark', 13.64, 13.64, 4, p_user_id);

  -- Software
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_software, 'Canva', 14.99, 14.99, 0, p_user_id),
    (v_period_id, v_cat_software, 'ChatGPT', 20.00, 20.00, 1, p_user_id),
    (v_period_id, v_cat_software, 'Claude', 110.30, 110.30, 2, p_user_id);

  -- Health
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_health, 'Tae Kwon Do', 134.18, 134.18, 0, p_user_id);

  -- Lifestyle
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_lifestyle, 'Movies', 0, 0, 0, p_user_id),
    (v_period_id, v_cat_lifestyle, 'Date Night', 0, 0, 1, p_user_id),
    (v_period_id, v_cat_lifestyle, 'Pedi/Mani', 0, 0, 2, p_user_id),
    (v_period_id, v_cat_lifestyle, 'Clothing Fund', 0, 0, 3, p_user_id);

  -- Wedding Expenses
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_wedding, 'Floral', 1200.00, 1200.00, 0, p_user_id);

  -- Savings Vault
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_savings, 'Travel Fund', 0, 0, 0, p_user_id),
    (v_period_id, v_cat_savings, 'Emergency Fund', 850.00, 850.00, 1, p_user_id);

  -- Allowance
  INSERT INTO budget_items (period_id, category_id, name, planned_amount, actual_amount, sort_order, created_by) VALUES
    (v_period_id, v_cat_allowance, 'Partner 1 Allowance', 0, 0, 0, p_user_id),
    (v_period_id, v_cat_allowance, 'Partner 2 Allowance', 0, 0, 1, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
