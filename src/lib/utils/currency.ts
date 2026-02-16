export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrencyString(value: string): number {
  const cleaned = value.replace(/[$,\s"]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function getDifferenceColor(planned: number, actual: number): string {
  if (planned === 0 && actual === 0) return 'text-muted-foreground'
  const diff = planned - actual
  if (diff > 0) return 'text-emerald-400'
  if (diff < 0) return 'text-red-400'
  return 'text-muted-foreground'
}

export function getDifferenceIcon(planned: number, actual: number): '▲' | '▼' | '—' {
  if (planned === 0 && actual === 0) return '—'
  const diff = planned - actual
  if (diff > 0) return '▲'
  if (diff < 0) return '▼'
  return '—'
}

export function getBudgetStatus(planned: number, actual: number): 'on-budget' | 'warning' | 'over-budget' | 'neutral' {
  if (planned === 0 && actual === 0) return 'neutral'
  if (planned === 0) return actual > 0 ? 'over-budget' : 'neutral'
  const ratio = actual / planned
  if (ratio <= 1) return 'on-budget'
  if (ratio <= 1.1) return 'warning'
  return 'over-budget'
}
