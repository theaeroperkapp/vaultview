CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Household',
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 12),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE household_members (
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (household_id, user_id)
);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their household"
  ON households FOR SELECT
  USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can update their household"
  ON households FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create households"
  ON households FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Members can view household members"
  ON household_members FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can manage household members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (SELECT id FROM households WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Owners can remove household members"
  ON household_members FOR DELETE
  USING (
    household_id IN (SELECT id FROM households WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Allow anyone to view households by invite code for joining
CREATE POLICY "Anyone can view household by invite code"
  ON households FOR SELECT
  USING (true);
