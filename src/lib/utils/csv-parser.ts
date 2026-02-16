import Papa from 'papaparse'
import { parseCurrencyString } from './currency'

export interface ParsedBudgetRow {
  category: string
  item: string
  planned: number
  actual: number
}

export interface ParsedBudgetData {
  items: ParsedBudgetRow[]
  income: number
  totalPlanned: number
  totalActual: number
}

export function parseBudgetCsv(file: File): Promise<ParsedBudgetData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const items: ParsedBudgetRow[] = []
        let income = 0
        let totalPlanned = 0
        let totalActual = 0

        for (const row of results.data as Record<string, string>[]) {
          const category = (row['Category'] || '').replace(/\*+/g, '').trim()
          const item = (row['Item'] || '').trim()
          const planned = parseCurrencyString(row['Planned ($)'] || '0')
          const actual = parseCurrencyString(row['Actual ($)'] || '0')

          // Skip empty rows
          if (!category && !item) continue

          // Extract summary rows
          if (category === 'TOTAL EXPENSES') {
            totalPlanned = planned
            totalActual = actual
            continue
          }
          if (category === 'INCOME') {
            income = planned || actual
            continue
          }
          if (category === 'BALANCE') continue

          // Regular budget item
          if (item) {
            items.push({ category, item, planned, actual })
          }
        }

        resolve({ items, income, totalPlanned, totalActual })
      },
      error(error) {
        reject(error)
      },
    })
  })
}
