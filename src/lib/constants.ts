export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

export const CATEGORY_ICONS: Record<string, string> = {
  'Fixed': 'lock',
  'Subscriptions': 'tv',
  'Software': 'code',
  'Health': 'heart-pulse',
  'Lifestyle': 'sparkles',
  'Wedding Expenses': 'gem',
  'Savings Vault': 'vault',
  'Allowance': 'wallet',
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Fixed': '#6366F1',
  'Subscriptions': '#8B5CF6',
  'Software': '#3B82F6',
  'Health': '#10B981',
  'Lifestyle': '#F59E0B',
  'Wedding Expenses': '#EC4899',
  'Savings Vault': '#14B8A6',
  'Allowance': '#F97316',
}

export const DEFAULT_CATEGORIES = [
  { name: 'Fixed', sort_order: 0, color: '#6366F1', icon: 'lock' },
  { name: 'Subscriptions', sort_order: 1, color: '#8B5CF6', icon: 'tv' },
  { name: 'Software', sort_order: 2, color: '#3B82F6', icon: 'code' },
  { name: 'Health', sort_order: 3, color: '#10B981', icon: 'heart-pulse' },
  { name: 'Lifestyle', sort_order: 4, color: '#F59E0B', icon: 'sparkles' },
  { name: 'Wedding Expenses', sort_order: 5, color: '#EC4899', icon: 'gem' },
  { name: 'Savings Vault', sort_order: 6, color: '#14B8A6', icon: 'vault' },
  { name: 'Allowance', sort_order: 7, color: '#F97316', icon: 'wallet' },
] as const
