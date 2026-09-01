import { useState } from "react"
import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Archive, Plus } from "@phosphor-icons/react"
import { PageShell } from "@/components/PageShell"
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
    <PageShell
      title={showArchived ? "Archívum" : "Listák"}
      action={
        <button
          type="button"
          aria-label={showArchived ? "Aktív listák" : "Archívum"}
          onClick={() => setShowArchived((v) => !v)}
          className="grid place-items-center size-12 rounded-3xl text-ink hover:bg-surface-raised transition"
        >
          <Archive size={22} weight={showArchived ? "fill" : "duotone"} />
        </button>
      }
    >
      {listsQuery.isLoading && <div className="text-ink-muted">Betöltés…</div>}
      {listsQuery.data && groups.length === 0 && (
        <p className="p-6 text-center text-ink-muted">
          {showArchived ? "Nincs archivált lista." : "Még nincs lista. + gombbal indíthatsz egyet."}
        </p>
      )}
      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="mb-1 text-xs font-medium text-ink-muted">{g.label}</div>
            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {g.lists.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/lists/${l.id}`)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-surface-raised"
                  >
                    <span className="flex-1 font-medium">{l.name}</span>
                    <span className="text-sm text-ink-muted">
                      {l.completedItems}/{l.totalItems}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {!showArchived && (
        <button
          type="button"
          aria-label="Új lista"
          onClick={() => setCreating(true)}
          className="fixed bottom-28 right-4 z-20 flex items-center gap-2 min-h-14 px-5 rounded-2xl bg-brand text-brand-on shadow-lg font-medium"
        >
          <Plus size={22} weight="duotone" /> Új lista
        </button>
      )}

      {creating && <NewListDialog onClose={() => setCreating(false)} />}
    </PageShell>
  )
}
