-- 008_simplify_roles.sql
-- Simplify roles from owner/editor/viewer to admin/member
-- All members (admin + member) get full edit access
-- Only admin can delete items and manage members

-- 1. Drop old constraint FIRST (so we can write new values)
ALTER TABLE household_members DROP CONSTRAINT IF EXISTS household_members_role_check;

-- 2. Migrate existing data
UPDATE household_members SET role = 'admin' WHERE role = 'owner';
UPDATE household_members SET role = 'member' WHERE role IN ('editor', 'viewer');

-- 3. Add new constraint
ALTER TABLE household_members ADD CONSTRAINT household_members_role_check CHECK (role IN ('admin', 'member'));

-- 3. Drop ALL old policies that reference old role values
--    (names from migration 006_fix_rls_recursion.sql)

-- household_members
DROP POLICY IF EXISTS "Owners can manage household members" ON household_members;
DROP POLICY IF EXISTS "Owners can remove household members" ON household_members;

-- budget_periods
DROP POLICY IF EXISTS "Editors can create budget periods" ON budget_periods;
DROP POLICY IF EXISTS "Editors can update budget periods" ON budget_periods;
DROP POLICY IF EXISTS "Owners can delete budget periods" ON budget_periods;

-- budget_categories
DROP POLICY IF EXISTS "Editors can manage categories" ON budget_categories;
DROP POLICY IF EXISTS "Editors can update categories" ON budget_categories;
DROP POLICY IF EXISTS "Owners can delete categories" ON budget_categories;

-- budget_items
DROP POLICY IF EXISTS "Editors can create budget items" ON budget_items;
DROP POLICY IF EXISTS "Editors can update budget items" ON budget_items;
DROP POLICY IF EXISTS "Owners can delete budget items" ON budget_items;

-- receipts
DROP POLICY IF EXISTS "Editors can upload receipts" ON receipts;
DROP POLICY IF EXISTS "Owners can delete receipts" ON receipts;

-- 4. Recreate all policies with new role values

-- === household_members ===

-- Admin can insert members (invite)
CREATE POLICY "Admins can manage household members"
  ON household_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_household_role(household_id) = 'admin'
  );

-- Admin can update member roles
CREATE POLICY "Admins can update member roles"
  ON household_members FOR UPDATE
  USING (public.get_user_household_role(household_id) = 'admin');

-- Admin can remove members (or member can leave)
CREATE POLICY "Admins can remove household members"
  ON household_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.get_user_household_role(household_id) = 'admin'
  );

-- === budget_periods (income editing lives here) ===

-- All members can create budget periods
CREATE POLICY "Members can create budget periods"
  ON budget_periods FOR INSERT
  WITH CHECK (public.get_user_household_role(household_id) IN ('admin', 'member'));

-- All members can update budget periods (including total_income)
CREATE POLICY "Members can update budget periods"
  ON budget_periods FOR UPDATE
  USING (public.get_user_household_role(household_id) IN ('admin', 'member'));

-- Only admin can delete budget periods
CREATE POLICY "Admins can delete budget periods"
  ON budget_periods FOR DELETE
  USING (public.get_user_household_role(household_id) = 'admin');

-- === budget_categories ===

-- All members can create categories
CREATE POLICY "Members can manage categories"
  ON budget_categories FOR INSERT
  WITH CHECK (public.get_user_household_role(household_id) IN ('admin', 'member'));

-- All members can update categories
CREATE POLICY "Members can update categories"
  ON budget_categories FOR UPDATE
  USING (public.get_user_household_role(household_id) IN ('admin', 'member'));

-- Only admin can delete categories
CREATE POLICY "Admins can delete categories"
  ON budget_categories FOR DELETE
  USING (public.get_user_household_role(household_id) = 'admin');

-- === budget_items ===

-- All members can create budget items
CREATE POLICY "Members can create budget items"
  ON budget_items FOR INSERT
  WITH CHECK (
    period_id IN (
      SELECT id FROM budget_periods
      WHERE public.get_user_household_role(household_id) IN ('admin', 'member')
    )
  );

-- All members can update budget items
CREATE POLICY "Members can update budget items"
  ON budget_items FOR UPDATE
  USING (
    period_id IN (
      SELECT id FROM budget_periods
      WHERE public.get_user_household_role(household_id) IN ('admin', 'member')
    )
  );

-- Only admin can delete budget items
CREATE POLICY "Admins can delete budget items"
  ON budget_items FOR DELETE
  USING (
    period_id IN (
      SELECT id FROM budget_periods
      WHERE public.get_user_household_role(household_id) = 'admin'
    )
  );

-- === receipts ===

-- All members can upload receipts
CREATE POLICY "Members can upload receipts"
  ON receipts FOR INSERT
  WITH CHECK (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      WHERE public.get_user_household_role(bp.household_id) IN ('admin', 'member')
    )
  );

-- Only admin can delete receipts
CREATE POLICY "Admins can delete receipts"
  ON receipts FOR DELETE
  USING (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      WHERE public.get_user_household_role(bp.household_id) = 'admin'
    )
  );
