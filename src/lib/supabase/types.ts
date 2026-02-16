export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          email: string
          role: 'owner' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          email: string
          role?: 'owner' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          email?: string
          role?: 'owner' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      households: {
        Row: {
          id: string
          name: string
          owner_id: string
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name?: string
          owner_id: string
          invite_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          invite_code?: string
          created_at?: string
        }
      }
      household_members: {
        Row: {
          household_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          household_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          household_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
      }
      budget_periods: {
        Row: {
          id: string
          household_id: string
          month: number
          year: number
          total_income: number
          notes: string | null
          is_locked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          month: number
          year: number
          total_income?: number
          notes?: string | null
          is_locked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          month?: number
          year?: number
          total_income?: number
          notes?: string | null
          is_locked?: boolean
          created_at?: string
        }
      }
      budget_categories: {
        Row: {
          id: string
          household_id: string
          name: string
          sort_order: number
          color: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          sort_order?: number
          color?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          sort_order?: number
          color?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      budget_items: {
        Row: {
          id: string
          period_id: string
          category_id: string
          name: string
          planned_amount: number
          actual_amount: number
          notes: string | null
          is_recurring: boolean
          sort_order: number
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_id: string
          category_id: string
          name: string
          planned_amount?: number
          actual_amount?: number
          notes?: string | null
          is_recurring?: boolean
          sort_order?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          category_id?: string
          name?: string
          planned_amount?: number
          actual_amount?: number
          notes?: string | null
          is_recurring?: boolean
          sort_order?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          budget_item_id: string
          image_url: string
          uploaded_by: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          budget_item_id: string
          image_url: string
          uploaded_by?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          budget_item_id?: string
          image_url?: string
          uploaded_by?: string | null
          description?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          household_id: string
          sender_id: string | null
          content: string
          message_type: 'text' | 'system' | 'budget_alert' | 'image'
          metadata: Json | null
          image_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          sender_id?: string | null
          content: string
          message_type?: 'text' | 'system' | 'budget_alert' | 'image'
          metadata?: Json | null
          image_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          sender_id?: string | null
          content?: string
          message_type?: 'text' | 'system' | 'budget_alert' | 'image'
          metadata?: Json | null
          image_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      purchase_requests: {
        Row: {
          id: string
          household_id: string
          requester_id: string
          title: string
          description: string | null
          amount: number
          category_id: string | null
          is_emergency: boolean
          purchase_date: string
          vote_deadline: string
          status: 'pending' | 'approved' | 'denied' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          requester_id: string
          title: string
          description?: string | null
          amount: number
          category_id?: string | null
          is_emergency?: boolean
          purchase_date: string
          vote_deadline: string
          status?: 'pending' | 'approved' | 'denied' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          requester_id?: string
          title?: string
          description?: string | null
          amount?: number
          category_id?: string | null
          is_emergency?: boolean
          purchase_date?: string
          vote_deadline?: string
          status?: 'pending' | 'approved' | 'denied' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      request_votes: {
        Row: {
          id: string
          request_id: string
          voter_id: string
          vote: 'yes' | 'no'
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          voter_id: string
          vote: 'yes' | 'no'
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          voter_id?: string
          vote?: 'yes' | 'no'
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          household_id: string
          user_id: string
          type: 'request_new' | 'request_vote' | 'request_approved' | 'request_denied' | 'budget_add' | 'budget_edit' | 'budget_remove'
          title: string
          body: string | null
          reference_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          type: 'request_new' | 'request_vote' | 'request_approved' | 'request_denied' | 'budget_add' | 'budget_edit' | 'budget_remove'
          title: string
          body?: string | null
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          type?: 'request_new' | 'request_vote' | 'request_approved' | 'request_denied' | 'budget_add' | 'budget_edit' | 'budget_remove'
          title?: string
          body?: string | null
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      seed_january_2026: {
        Args: {
          p_household_id: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Household = Tables<'households'>
export type HouseholdMember = Tables<'household_members'>
export type BudgetPeriod = Tables<'budget_periods'>
export type BudgetCategory = Tables<'budget_categories'>
export type BudgetItem = Tables<'budget_items'>
export type Receipt = Tables<'receipts'>
export type Message = Tables<'messages'>
export type PurchaseRequest = Tables<'purchase_requests'>
export type RequestVote = Tables<'request_votes'>
export type Notification = Tables<'notifications'>
