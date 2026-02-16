-- Purchase Requests + Voting + Notifications System

-- ============================================================
-- Table: purchase_requests
-- ============================================================
CREATE TABLE public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  purchase_date DATE NOT NULL,
  vote_deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Table: request_votes
-- ============================================================
CREATE TABLE public.request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, voter_id)
);

ALTER TABLE public.request_votes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Table: notifications
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('request_new', 'request_vote', 'request_approved', 'request_denied', 'budget_add', 'budget_edit', 'budget_remove')),
  title TEXT NOT NULL,
  body TEXT,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: purchase_requests
-- ============================================================

-- Members can view their household's requests
CREATE POLICY "Members can view purchase requests"
  ON purchase_requests FOR SELECT
  USING (household_id IN (SELECT public.get_user_household_ids()));

-- Members can create requests (must be the requester)
CREATE POLICY "Members can create purchase requests"
  ON purchase_requests FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.get_user_household_ids())
    AND requester_id = auth.uid()
  );

-- Requester can update own request (cancel)
CREATE POLICY "Requester can update own request"
  ON purchase_requests FOR UPDATE
  USING (requester_id = auth.uid());

-- ============================================================
-- RLS Policies: request_votes
-- ============================================================

-- Members can view votes on their household's requests
CREATE POLICY "Members can view request votes"
  ON request_votes FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM purchase_requests
      WHERE household_id IN (SELECT public.get_user_household_ids())
    )
  );

-- Members can cast votes (must be the voter)
CREATE POLICY "Members can cast votes"
  ON request_votes FOR INSERT
  WITH CHECK (
    voter_id = auth.uid()
    AND request_id IN (
      SELECT id FROM purchase_requests
      WHERE household_id IN (SELECT public.get_user_household_ids())
    )
  );

-- ============================================================
-- RLS Policies: notifications
-- ============================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Members can insert notifications for household members
CREATE POLICY "Members can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.get_user_household_ids())
  );

-- Users can update own notifications (mark read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- Enable realtime for new tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
