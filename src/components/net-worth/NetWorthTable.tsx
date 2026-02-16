"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils/currency"
import { getMonthName } from "@/lib/utils/dates"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface NetWorthTableProps {
  data: PeriodSummary[]
}

export function NetWorthTable({ data }: NetWorthTableProps) {
  // Show newest first
  const reversed = [...data].reverse()

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Month-by-Month Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2A2D3A]/50 hover:bg-transparent">
              <TableHead className="text-[#94A3B8]">Month</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Income</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Expenses</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Monthly Balance</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Cumulative Net Worth</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reversed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#94A3B8] py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              reversed.map((row, i) => {
                const prevRow = i < reversed.length - 1 ? reversed[i + 1] : null
                const change = prevRow
                  ? row.cumulativeNetWorth - prevRow.cumulativeNetWorth
                  : row.balance

                return (
                  <TableRow key={`${row.year}-${row.month}`} className="border-[#2A2D3A]/50 hover:bg-[#1E2130]">
                    <TableCell className="text-sm text-white">
                      {getMonthName(row.month)} {row.year}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-400">
                      {formatCurrency(row.income)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-400">
                      {formatCurrency(row.totalActual)}
                    </TableCell>
                    <TableCell className={`text-right tabular-nums ${row.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {row.balance >= 0 ? "+" : ""}{formatCurrency(row.balance)}
                    </TableCell>
                    <TableCell className={`text-right tabular-nums font-medium ${row.cumulativeNetWorth >= 0 ? "text-white" : "text-red-400"}`}>
                      {formatCurrency(row.cumulativeNetWorth)}
                    </TableCell>
                    <TableCell className={`text-right tabular-nums text-xs ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {change >= 0 ? "+" : ""}{formatCurrency(change)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
