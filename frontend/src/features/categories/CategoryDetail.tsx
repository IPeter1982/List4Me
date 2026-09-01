import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, DotsThreeVertical, MagnifyingGlass, Plus, Package, PencilSimple, Trash } from "@phosphor-icons/react"
import { BottomNav } from "@/components/BottomNav"
import { cn } from "@/lib/cn"
import { ApiError } from "@/lib/api"
import { categoriesApi } from "./api"
import type { Category } from "./types"
import { CategoryEditor } from "./CategoryEditor"
import { listsApi } from "@/features/lists/api"
import type { ListSummaryDto } from "@/features/lists/types"
import { NewListDialog } from "@/features/lists/NewListDialog"

function findWithParent(
  cats: Category[],
  id: string,
  parent: Category | null = null
): { cat: Category; parent: Category | null } | null {
  for (const c of cats) {
    if (c.id === id) return { cat: c, parent }
    const found = findWithParent(c.subcategories ?? [], id, c)
    if (found) return found
  }
  return null
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "most"
  if (mins < 60) return `${mins} perce`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} órája`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} napja`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} hete`
  return new Date(iso).toLocaleDateString("hu-HU")
}

export function CategoryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tabId, setTabId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)

  const catsQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list
  })

  const del = useMutation({
    mutationFn: (payload: { id: string; force: boolean }) =>
      categoriesApi.remove(payload.id, payload.force),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      setMenuOpen(false)
      navigate("/")
    }
  })

  const found = id && catsQuery.data ? findWithParent(catsQuery.data, id) : null
  const category = found?.cat
  const parent = found?.parent

  const activeCatId = tabId ?? id ?? ""
  const listsQuery = useQuery({
    queryKey: ["lists", { categoryId: activeCatId, archived: false }],
    queryFn: () => listsApi.list({ categoryId: activeCatId, archived: false }),
    enabled: !!activeCatId
  })

  const tabs = useMemo(() => {
    if (!category) return []
    const subs = category.subcategories ?? []
    if (subs.length === 0) return []
    return [
      { id: category.id, name: "Mind" },
      ...subs.map(s => ({ id: s.id, name: s.name }))
    ]
  }, [category])

  const currentTabId = tabId ?? category?.id

  return (
    <div className="flex flex-col min-h-screen bg-surface-bg text-ink">
      <header className="shrink-0 bg-surface-bg">
        <div className="flex items-center gap-0.5 min-h-14 px-1.5">
          <button
            type="button"
            aria-label="Vissza"
            onClick={() => navigate(parent ? `/categories/${parent.id}` : "/")}
            className="grid place-items-center size-12 rounded-3xl text-ink hover:bg-surface-raised transition"
          >
            <ArrowLeft size={22} weight="duotone" />
          </button>
          <span className="flex-1 text-[20px] font-medium tracking-tight truncate">
            {category?.name ?? "…"}
          </span>
          <button
            type="button"
            aria-label="Keresés"
            onClick={() => navigate("/lists")}
            className="grid place-items-center size-12 rounded-3xl text-ink hover:bg-surface-raised transition"
          >
            <MagnifyingGlass size={22} weight="duotone" />
          </button>
          <button
            type="button"
            aria-label="Menü"
            onClick={() => setMenuOpen(true)}
            className="grid place-items-center size-12 rounded-3xl text-ink hover:bg-surface-raised transition"
          >
            <DotsThreeVertical size={22} weight="duotone" />
          </button>
        </div>
        {tabs.length > 0 && (
          <div className="flex overflow-x-auto" style={{ boxShadow: "inset 0 -1px 0 var(--line)" }}>
            {tabs.map(t => {
              const active = t.id === currentTabId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTabId(t.id === category?.id ? null : t.id)}
                  className={cn(
                    "flex-1 relative min-w-24 min-h-12 px-3.5 text-sm font-medium tracking-wide",
                    active ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {t.name}
                  <span
                    className="absolute left-4 right-4 bottom-0 h-[3px] rounded-t-[3px] bg-brand transition-opacity"
                    style={{ opacity: active ? 1 : 0 }}
                  />
                </button>
              )
            })}
          </div>
        )}
      </header>

      <main className="flex-1 px-4 pb-28 pt-5">
        <div className="text-[12.5px] font-medium text-ink-muted px-2 pb-2.5">Aktív listák</div>
        {listsQuery.isLoading && <div className="text-ink-muted px-2">Betöltés…</div>}
        {listsQuery.data && listsQuery.data.length === 0 && (
          <p className="p-6 text-center text-ink-muted">Nincs aktív lista ebben a kategóriában.</p>
        )}
        <div className="flex flex-col gap-3">
          {listsQuery.data?.map(l => (
            <ListCard key={l.id} list={l} onOpen={() => navigate(`/lists/${l.id}`)} />
          ))}
        </div>
      </main>

      <button
        type="button"
        onClick={() => setCreating(true)}
        aria-label="Új lista"
        className="fixed bottom-28 right-4 z-20 flex items-center gap-2 min-h-14 px-5 rounded-2xl bg-brand text-brand-on shadow-lg font-medium"
      >
        <Plus size={22} weight="duotone" /> Új lista
      </button>

      {creating && (
        <NewListDialog
          onClose={() => setCreating(false)}
          presetCategoryId={currentTabId ?? id}
        />
      )}

      {menuOpen && category && (
        <CategoryMenuSheet
          category={category}
          onClose={() => { del.reset(); setMenuOpen(false) }}
          onEdit={() => { setMenuOpen(false); setEditing(true) }}
          onOpenProducts={() => { setMenuOpen(false); navigate(`/categories/${category.id}/products`) }}
          onDelete={(force) => del.mutate({ id: category.id, force })}
          deleteError={del.error instanceof ApiError ? del.error : null}
        />
      )}

      {editing && category && (
        <CategoryEditor
          open
          onOpenChange={(o) => !o && setEditing(false)}
          category={category}
        />
      )}

      <BottomNav />
    </div>
  )
}

function ListCard({ list, onOpen }: { list: ListSummaryDto; onOpen: () => void }) {
  const pct = list.totalItems > 0 ? Math.round((list.completedItems / list.totalItems) * 100) : 0
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-2.5 p-4 rounded-2xl bg-surface-raised text-ink text-left active:scale-[.985] transition"
    >
      <span className="flex items-center gap-2.5">
        <span className="flex-1 text-[17px] font-medium">{list.name}</span>
        <span className="text-[12.5px] text-ink-muted tabular-nums">
          {list.completedItems}/{list.totalItems}
        </span>
      </span>
      <span className="block h-1 rounded bg-surface-sunken overflow-hidden">
        <span
          className="block h-1 rounded bg-success"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-[12.5px] text-ink-muted">{formatRelative(list.createdAt)}</span>
    </button>
  )
}

function CategoryMenuSheet({
  category, onClose, onEdit, onOpenProducts, onDelete, deleteError
}: {
  category: Category
  onClose: () => void
  onEdit: () => void
  onOpenProducts: () => void
  onDelete: (force: boolean) => void
  deleteError: ApiError | null
}) {
  const [confirmForce, setConfirmForce] = useState(false)
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full rounded-t-3xl bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-1"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-line" />
        <h3 className="text-lg font-medium px-3 pb-2">{category.name}</h3>
        <button
          type="button"
          onClick={onOpenProducts}
          className="w-full flex items-center gap-3 min-h-14 px-4 rounded-2xl hover:bg-surface-raised text-left"
        >
          <Package size={22} weight="duotone" className="text-ink-muted" />
          <span className="text-[15px]">Termékek kezelése</span>
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="w-full flex items-center gap-3 min-h-14 px-4 rounded-2xl hover:bg-surface-raised text-left"
        >
          <PencilSimple size={22} weight="duotone" className="text-ink-muted" />
          <span className="text-[15px]">Szerkesztés</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(confirmForce)}
          className="w-full flex items-center gap-3 min-h-14 px-4 rounded-2xl hover:bg-danger-soft text-left text-danger"
        >
          <Trash size={22} weight="duotone" />
          <span className="text-[15px]">{confirmForce ? "Igen, törlés" : "Törlés"}</span>
        </button>
        {deleteError?.status === 409 && !confirmForce && (
          <p className="px-4 pt-2 text-[13px] text-ink-muted">
            A kategória nem üres. Kaszkádolt törléshez koppints újra a Törlés-re.
            <button
              type="button"
              className="block text-brand mt-1"
              onClick={() => setConfirmForce(true)}
            >Kaszkádolt törlés bekapcsolása</button>
          </p>
        )}
      </div>
    </div>
  )
}
