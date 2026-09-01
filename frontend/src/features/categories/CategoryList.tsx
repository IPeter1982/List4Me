import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus, Package, UsersThree, CaretRight } from "@phosphor-icons/react"
import { PageShell } from "@/components/PageShell"
import { categoriesApi } from "./api"
import { householdApi } from "@/features/household/api"
import { listsApi } from "@/features/lists/api"
import { getIcon } from "@/lib/icons"
import type { Category } from "./types"
import { CategoryCard } from "./CategoryCard"
import { CategoryEditor } from "./CategoryEditor"

function findCategory(cats: Category[], id: string): Category | undefined {
  for (const c of cats) {
    if (c.id === id) return c
    const sub = findCategory(c.subcategories ?? [], id)
    if (sub) return sub
  }
  return undefined
}

export function CategoryListScreen() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ["categories"], queryFn: categoriesApi.list
  })
  const { data: household } = useQuery({
    queryKey: ["household", "me"], queryFn: householdApi.getMe
  })
  const { data: lists } = useQuery({
    queryKey: ["lists", { archived: false }],
    queryFn: () => listsApi.list({ archived: false })
  })
  const [creating, setCreating] = useState(false)

  const metaByCategory = useMemo(() => {
    const m = new Map<string, { lists: number; items: number }>()
    for (const l of lists ?? []) {
      const prev = m.get(l.categoryId) ?? { lists: 0, items: 0 }
      m.set(l.categoryId, { lists: prev.lists + 1, items: prev.items + l.totalItems })
    }
    return m
  }, [lists])

  const recent = useMemo(() => {
    if (!lists) return []
    return [...lists]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3)
  }, [lists])

  const subtitle = household
    ? `${household.name} · ${household.members.length} tag`
    : undefined

  return (
    <PageShell
      title="Kategóriák"
      subtitle={subtitle}
      action={
        <button
          type="button"
          aria-label="Háztartás"
          onClick={() => navigate("/settings")}
          className="grid place-items-center size-12 rounded-3xl text-ink hover:bg-surface-raised transition"
        >
          <UsersThree size={24} weight="duotone" />
        </button>
      }
    >
      {isLoading && <div className="text-ink-muted">Betöltés…</div>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {data.map(c => {
              const m = metaByCategory.get(c.id)
              const meta = m ? `${m.lists} lista · ${m.items} tétel` : undefined
              return (
                <CategoryCard
                  key={c.id}
                  category={c}
                  meta={meta}
                  onClick={() => navigate(`/categories/${c.id}`)}
                />
              )
            })}
          </div>

          {recent.length > 0 && (
            <div className="mt-6 px-2">
              <div className="text-[12.5px] font-medium text-ink-muted mb-1">Legutóbb módosítva</div>
              <ul>
                {recent.map(r => {
                  const cat = findCategory(data, r.categoryId)
                  const Icon = cat ? getIcon(cat.iconKey) : Package
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/lists/${r.id}`)}
                        className="w-full flex items-center gap-3.5 min-h-[60px] py-2 text-left"
                      >
                        <span className="grid place-items-center w-10 h-10 rounded-[20px] bg-surface-raised text-ink-muted shrink-0">
                          <Icon size={20} weight="duotone" />
                        </span>
                        <span className="flex-1 min-w-0 flex flex-col">
                          <span className="text-[15px] truncate">{r.name}</span>
                          <span className="text-[12.5px] text-ink-muted">
                            {cat?.name ?? "?"} · {r.completedItems}/{r.totalItems}
                          </span>
                        </span>
                        <CaretRight size={16} weight="duotone" className="text-ink-muted" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCreating(true)}
            aria-label="Új kategória"
            className="fixed bottom-28 right-4 z-20 flex items-center gap-2 min-h-14 px-5 rounded-2xl bg-brand text-brand-on shadow-lg font-medium"
          >
            <Plus size={22} weight="duotone" /> Új kategória
          </button>
        </>
      )}

      {creating && (
        <CategoryEditor open={creating} onOpenChange={setCreating} parentCategoryId={null} />
      )}
    </PageShell>
  )
}
