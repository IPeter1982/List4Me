import { useState } from "react"
import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Archive, Plus } from "lucide-react"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { categoriesApi } from "@/features/categories/api"
import type { Category } from "@/features/categories/types"
import { listsApi } from "./api"
import type { ListSummaryDto } from "./types"
import { NewListDialog } from "./NewListDialog"

function findCategory(cats: Category[], id: string): Category | undefined {
  for (const c of cats) {
    if (c.id === id) return c
    const sub = findCategory(c.subcategories ?? [], id)
    if (sub) return sub
  }
  return undefined
}

export function ListsOverview() {
  const navigate = useNavigate()
  const [showArchived, setShowArchived] = useState(false)
  const [creating, setCreating] = useState(false)

  const listsQuery = useQuery({
    queryKey: ["lists", { archived: showArchived }],
    queryFn: () => listsApi.list({ archived: showArchived }),
  })
  const catQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  })

  const groups: { key: string; label: string; lists: ListSummaryDto[] }[] = []
  const byCat = new Map<string, ListSummaryDto[]>()
  for (const l of listsQuery.data ?? []) {
    const arr = byCat.get(l.categoryId) ?? []
    arr.push(l)
    byCat.set(l.categoryId, arr)
  }
  for (const [catId, lists] of byCat) {
    const cat = findCategory(catQuery.data ?? [], catId)
    groups.push({ key: catId, label: cat?.name ?? "?", lists })
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b dark:bg-neutral-900/90">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">
            {showArchived ? "Archívum" : "Listák"}
          </h1>
          <Button
            variant="ghost"
            onClick={() => setShowArchived((v) => !v)}
            aria-label={showArchived ? "Aktív listák" : "Archívum"}
            className="px-3"
          >
            <Archive className="size-4 mr-1" />
            {showArchived ? "Aktív" : "Archívum"}
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {listsQuery.isLoading && <div className="text-neutral-500">Betöltés…</div>}
        {listsQuery.data && groups.length === 0 && (
          <p className="p-6 text-center text-neutral-500">
            {showArchived ? "Nincs archivált lista." : "Még nincs lista. + gombbal indíthatsz egyet."}
          </p>
        )}
        {groups.map((g) => (
          <section key={g.key}>
            <div className="mb-1 text-xs font-medium text-neutral-500">{g.label}</div>
            <ul className="divide-y rounded-xl border bg-white dark:bg-neutral-900">
              {g.lists.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/lists/${l.id}`)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <span className="flex-1 font-medium">{l.name}</span>
                    <span className="text-sm text-neutral-500">
                      {l.completedItems}/{l.totalItems}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {!showArchived && (
        <button
          type="button"
          aria-label="Új lista"
          onClick={() => setCreating(true)}
          className="fixed bottom-24 right-4 z-20 size-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-blue-700"
        >
          <Plus className="size-6" />
        </button>
      )}

      {creating && <NewListDialog onClose={() => setCreating(false)} />}

      <BottomNav />
    </div>
  )
}
