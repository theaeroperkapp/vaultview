import { arrayMove } from "@dnd-kit/sortable"
import { createClient } from "@/lib/supabase/client"

export function reorderList<T extends { id: string; sort_order: number }>(
  items: T[],
  activeId: string,
  overId: string
): T[] {
  const oldIndex = items.findIndex((i) => i.id === activeId)
  const newIndex = items.findIndex((i) => i.id === overId)
  if (oldIndex === -1 || newIndex === -1) return items

  const reordered = arrayMove(items, oldIndex, newIndex)
  return reordered.map((item, index) => ({ ...item, sort_order: index }))
}

export function persistCategorySortOrder(categories: { id: string; sort_order: number }[]) {
  const supabase = createClient()
  categories.forEach((cat) => {
    supabase
      .from("budget_categories")
      .update({ sort_order: cat.sort_order })
      .eq("id", cat.id)
      .then()
  })
}

export function persistItemSortOrder(items: { id: string; sort_order: number }[]) {
  const supabase = createClient()
  items.forEach((item) => {
    supabase
      .from("budget_items")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id)
      .then()
  })
}
