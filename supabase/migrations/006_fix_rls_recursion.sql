-- Fix infinite recursion in RLS policies
-- The issue: household_members SELECT policy queries household_members itself

-- Step 1: Create a SECURITY DEFINER function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_user_household_ids()
RETURNS SETOF UUID AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_household_role(p_household_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.household_members WHERE user_id = auth.uid() AND household_id = p_household_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Drop all existing policies that cause recursion

-- household_members policies
DROP POLICY IF EXISTS "Members can view household members" ON household_members;
DROP POLICY IF EXISTS "Owners can manage household members" ON household_members;
DROP POLICY IF EXISTS "Owners can remove household members" ON household_members;

-- households policies
DROP POLICY IF EXISTS "Members can view their household" ON households;
DROP POLICY IF EXISTS "Anyone can view household by invite code" ON households;

-- budget_periods policies
DROP POLICY IF EXISTS "Members can view budget periods" ON budget_periods;
DROP POLICY IF EXISTS "Editors can create budget periods" ON budget_periods;
DROP POLICY IF EXISTS "Editors can update budget periods" ON budget_periods;
DROP POLICY IF EXISTS "Owners can delete budget periods" ON budget_periods;

-- budget_categories policies
DROP POLICY IF EXISTS "Members can view categories" ON budget_categories;
DROP POLICY IF EXISTS "Editors can manage categories" ON budget_categories;
DROP POLICY IF EXISTS "Editors can update categories" ON budget_categories;
DROP POLICY IF EXISTS "Owners can delete categories" ON budget_categories;

-- budget_items policies
DROP POLICY IF EXISTS "Members can view budget items" ON budget_items;
DROP POLICY IF EXISTS "Editors can create budget items" ON budget_items;
DROP POLICY IF EXISTS "Editors can update budget items" ON budget_items;
DROP POLICY IF EXISTS "Owners can delete budget items" ON budget_items;

-- receipts policies
DROP POLICY IF EXISTS "Members can view receipts" ON receipts;
DROP POLICY IF EXISTS "Editors can upload receipts" ON receipts;
DROP POLICY IF EXISTS "Owners can delete receipts" ON receipts;

-- messages policies
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can send messages" ON messages;

-- Step 3: Recreate all policies using the helper functions

-- household_members: use direct user_id check for SELECT (no self-reference)
CREATE POLICY "Members can view household members"
  ON household_members FOR SELECT
  USING (user_id = auth.uid() OR household_id IN (SELECT public.get_user_household_ids()));

CREATE POLICY "Owners can manage household members"
  ON household_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_household_role(household_id) = 'owner'
  );

CREATE POLICY "Owners can remove household members"
  ON household_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.get_user_household_role(household_id) = 'owner'
  );

-- households
CREATE POLICY "Members can view their household"
  ON households FOR SELECT
  USING (id IN (SELECT public.get_user_household_ids()));

CREATE POLICY "Anyone can view household by invite code"
  ON households FOR SELECT
  USING (invite_code IS NOT NULL);

-- budget_periods
CREATE POLICY "Members can view budget periods"
  ON budget_periods FOR SELECT
  USING (household_id IN (SELECT public.get_user_household_ids()));

CREATE POLICY "Editors can create budget periods"
  ON budget_periods FOR INSERT
  WITH CHECK (public.get_user_household_role(household_id) IN ('owner', 'editor'));

CREATE POLICY "Editors can update budget periods"
  ON budget_periods FOR UPDATE
  USING (public.get_user_household_role(household_id) IN ('owner', 'editor'));

CREATE POLICY "Owners can delete budget periods"
  ON budget_periods FOR DELETE
  USING (public.get_user_household_role(household_id) = 'owner');

-- budget_categories
CREATE POLICY "Members can view categories"
  ON budget_categories FOR SELECT
  USING (household_id IN (SELECT public.get_user_household_ids()));

CREATE POLICY "Editors can manage categories"
  ON budget_categories FOR INSERT
  WITH CHECK (public.get_user_household_role(household_id) IN ('owner', 'editor'));

CREATE POLICY "Editors can update categories"
  ON budget_categories FOR UPDATE
  USING (public.get_user_household_role(household_id) IN ('owner', 'editor'));

CREATE POLICY "Owners can delete categories"
  ON budget_categories FOR DELETE
  USING (public.get_user_household_role(household_id) = 'owner');

-- budget_items (join through budget_periods to get household_id)
CREATE POLICY "Members can view budget items"
  ON budget_items FOR SELECT
  USING (
    period_id IN (
      SELECT id FROM budget_periods WHERE household_id IN (SELECT public.get_user_household_ids())
    )
  );

CREATE POLICY "Editors can create budget items"
  ON budget_items FOR INSERT
  WITH CHECK (
    period_id IN (
      SELECT id FROM budget_periods
      WHERE public.get_user_household_role(household_id) IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update budget items"
  ON budget_items FOR UPDATE
  USING (
    period_id IN (
      SELECT id FROM budget_periods
      WHERE public.get_user_household_role(household_id) IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete budget items"
  ON budget_items FOR DELETE
  USING (
    period_id IN (
      SELECT id FROM budget_periods
      WHERE public.get_user_household_role(household_id) = 'owner'
    )
  );

-- receipts
CREATE POLICY "Members can view receipts"
  ON receipts FOR SELECT
  USING (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      WHERE bp.household_id IN (SELECT public.get_user_household_ids())
    )
  );

CREATE POLICY "Editors can upload receipts"
  ON receipts FOR INSERT
  WITH CHECK (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      WHERE public.get_user_household_role(bp.household_id) IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete receipts"
  ON receipts FOR DELETE
  USING (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      WHERE public.get_user_household_role(bp.household_id) = 'owner'
    )
  );

-- messages
CREATE POLICY "Members can view messages"
  ON messages FOR SELECT
  USING (household_id IN (SELECT public.get_user_household_ids()));

CREATE POLICY "Members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.get_user_household_ids())
    AND sender_id = auth.uid()
  );
