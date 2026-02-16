import { createClient } from '@/lib/supabase/client'
import type { InsertTables } from '@/lib/supabase/types'

type AuditEntry = Omit<InsertTables<'budget_audit_log'>, 'id' | 'created_at'>

/**
 * Fire-and-forget audit log insert.
 * Never blocks the caller or surfaces errors — audit logging
 * should never interfere with the user's workflow.
 */
export function logBudgetChange(entry: AuditEntry) {
  const supabase = createClient()
  supabase
    .from('budget_audit_log')
    .insert(entry)
    .then(({ error }) => {
      if (error) console.warn('[audit]', error.message)
    })
}
