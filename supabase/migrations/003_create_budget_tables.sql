CREATE TABLE budget_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_income NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, month, year)
);

CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES budget_periods(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planned_amount NUMERIC(12,2) DEFAULT 0,
  actual_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_item_id UUID REFERENCES budget_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Budget periods policies
CREATE POLICY "Members can view budget periods"
  ON budget_periods FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can create budget periods"
  ON budget_periods FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update budget periods"
  ON budget_periods FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete budget periods"
  ON budget_periods FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Budget categories policies
CREATE POLICY "Members can view categories"
  ON budget_categories FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can manage categories"
  ON budget_categories FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update categories"
  ON budget_categories FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete categories"
  ON budget_categories FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Budget items policies
CREATE POLICY "Members can view budget items"
  ON budget_items FOR SELECT
  USING (
    period_id IN (
      SELECT bp.id FROM budget_periods bp
      JOIN household_members hm ON hm.household_id = bp.household_id
      WHERE hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create budget items"
  ON budget_items FOR INSERT
  WITH CHECK (
    period_id IN (
      SELECT bp.id FROM budget_periods bp
      JOIN household_members hm ON hm.household_id = bp.household_id
      WHERE hm.user_id = auth.uid() AND hm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update budget items"
  ON budget_items FOR UPDATE
  USING (
    period_id IN (
      SELECT bp.id FROM budget_periods bp
      JOIN household_members hm ON hm.household_id = bp.household_id
      WHERE hm.user_id = auth.uid() AND hm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete budget items"
  ON budget_items FOR DELETE
  USING (
    period_id IN (
      SELECT bp.id FROM budget_periods bp
      JOIN household_members hm ON hm.household_id = bp.household_id
      WHERE hm.user_id = auth.uid() AND hm.role = 'owner'
    )
  );

-- Receipts policies
CREATE POLICY "Members can view receipts"
  ON receipts FOR SELECT
  USING (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      JOIN household_members hm ON hm.household_id = bp.household_id
      WHERE hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can upload receipts"
  ON receipts FOR INSERT
  WITH CHECK (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      JOIN household_members hm ON hm.household_id = bp.household_id
      WHERE hm.user_id = auth.uid() AND hm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete receipts"
  ON receipts FOR DELETE
  USING (
    budget_item_id IN (
      SELECT bi.id FROM budget_items bi
      JOIN budget_periods bp ON bp.id = bi.period_id
      JOIN household_members hm ON hm.household_id = bp.household_id
      WHERE hm.user_id = auth.uid() AND hm.role = 'owner'
    )
  );
