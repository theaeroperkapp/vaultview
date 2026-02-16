"use client"

import { useState, useCallback } from "react"
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { parseBudgetCsv, type ParsedBudgetData } from "@/lib/utils/csv-parser"
import { formatCurrency } from "@/lib/utils/currency"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MONTH_NAMES } from "@/lib/constants"

interface CsvImporterProps {
  householdId: string
}

export function CsvImporter({ householdId }: CsvImporterProps) {
  const [parsedData, setParsedData] = useState<ParsedBudgetData | null>(null)
  const [fileName, setFileName] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [isImporting, setIsImporting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file")
      return
    }
    setFileName(file.name)
    try {
      const data = await parseBudgetCsv(file)
      setParsedData(data)
      toast.success(`Parsed ${data.items.length} items`)
    } catch {
      toast.error("Failed to parse CSV file")
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleImport = async () => {
    if (!parsedData) return
    setIsImporting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const month = parseInt(selectedMonth)
    const year = parseInt(selectedYear)

    try {
      // Create or get period
      let { data: period } = await supabase
        .from("budget_periods")
        .select("*")
        .eq("household_id", householdId)
        .eq("month", month)
        .eq("year", year)
        .single()

      if (!period) {
        const { data: newPeriod, error } = await supabase
          .from("budget_periods")
          .insert({
            household_id: householdId,
            month,
            year,
            total_income: parsedData.income,
          })
          .select()
          .single()
        if (error) throw error
        period = newPeriod
      } else {
        await supabase
          .from("budget_periods")
          .update({ total_income: parsedData.income })
          .eq("id", period.id)
      }

      // Get existing categories
      const { data: existingCategories } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("household_id", householdId)

      const categoryMap: Record<string, string> = {}
      for (const cat of existingCategories || []) {
        categoryMap[cat.name] = cat.id
      }

      // Create missing categories
      const uniqueCategories = [...new Set(parsedData.items.map((i) => i.category))]
      for (const catName of uniqueCategories) {
        if (!categoryMap[catName]) {
          const { data: newCat } = await supabase
            .from("budget_categories")
            .insert({
              household_id: householdId,
              name: catName,
              sort_order: Object.keys(categoryMap).length,
            })
            .select()
            .single()
          if (newCat) categoryMap[catName] = newCat.id
        }
      }

      // Delete existing items for this period (overwrite)
      await supabase
        .from("budget_items")
        .delete()
        .eq("period_id", period!.id)

      // Insert items
      const itemsToInsert = parsedData.items.map((item, idx) => ({
        period_id: period!.id,
        category_id: categoryMap[item.category],
        name: item.item,
        planned_amount: item.planned,
        actual_amount: item.actual,
        sort_order: idx,
        created_by: user?.id,
      }))

      const { error: insertError } = await supabase
        .from("budget_items")
        .insert(itemsToInsert)

      if (insertError) throw insertError

      toast.success(`Imported ${parsedData.items.length} items successfully!`)
      router.push("/budget")
    } catch (err) {
      toast.error("Import failed: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!parsedData && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            isDragOver
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-[#2A2D3A] hover:border-[#3A3D4A]"
          }`}
        >
          <Upload className="mb-4 h-12 w-12 text-[#94A3B8]" />
          <p className="mb-2 text-lg font-medium text-white">Drop your CSV file here</p>
          <p className="mb-4 text-sm text-[#94A3B8]">or click to browse</p>
          <label>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <Button asChild className="bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer">
              <span>Choose File</span>
            </Button>
          </label>
        </div>
      )}

      {/* Preview */}
      {parsedData && (
        <>
          <Card className="border-[#2A2D3A] bg-[#1A1D27]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-base text-white">{fileName}</CardTitle>
                </div>
                <Button variant="ghost" className="text-[#94A3B8]" onClick={() => setParsedData(null)}>
                  Choose different file
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Target month/year */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#94A3B8]">Import to:</span>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-36 border-[#2A2D3A] bg-[#0F1117] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#2A2D3A] bg-[#1A1D27]">
                      {MONTH_NAMES.map((name, i) => (
                        <SelectItem key={i} value={String(i + 1)} className="text-white hover:bg-[#2A2D3A]">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-24 border-[#2A2D3A] bg-[#0F1117] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#2A2D3A] bg-[#1A1D27]">
                      {[2025, 2026, 2027].map((y) => (
                        <SelectItem key={y} value={String(y)} className="text-white hover:bg-[#2A2D3A]">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto flex items-center gap-4 text-sm">
                  <span className="text-[#94A3B8]">
                    Income: <span className="font-semibold text-emerald-400">{formatCurrency(parsedData.income)}</span>
                  </span>
                  <span className="text-[#94A3B8]">
                    Items: <span className="font-semibold text-white">{parsedData.items.length}</span>
                  </span>
                </div>
              </div>

              {/* Data preview table */}
              <div className="max-h-[400px] overflow-auto rounded-lg border border-[#2A2D3A]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2D3A] hover:bg-transparent">
                      <TableHead className="text-[#94A3B8]">Category</TableHead>
                      <TableHead className="text-[#94A3B8]">Item</TableHead>
                      <TableHead className="text-right text-[#94A3B8]">Planned</TableHead>
                      <TableHead className="text-right text-[#94A3B8]">Actual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.items.map((item, i) => (
                      <TableRow key={i} className="border-[#2A2D3A] hover:bg-[#1E2130]">
                        <TableCell className="text-sm text-[#94A3B8]">{item.category}</TableCell>
                        <TableCell className="text-sm text-white">{item.item}</TableCell>
                        <TableCell className="text-right tabular-nums text-[#94A3B8]">
                          {formatCurrency(item.planned)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-white">
                          {formatCurrency(item.actual)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-400">
                  This will replace all existing budget items for the selected month. Categories will be created if they don&apos;t exist.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" className="border-[#2A2D3A] text-[#94A3B8]" onClick={() => setParsedData(null)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                "Importing..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Import {parsedData.items.length} Items
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
