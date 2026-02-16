import { MONTH_NAMES } from '../constants'

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || ''
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`
}

export function getPreviousMonth(month: number, year: number): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 }
  return { month: month - 1, year }
}

export function getNextMonth(month: number, year: number): { month: number; year: number } {
  if (month === 12) return { month: 1, year: year + 1 }
  return { month: month + 1, year }
}
