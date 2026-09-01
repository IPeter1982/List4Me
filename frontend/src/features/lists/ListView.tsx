import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Archive, ArrowLeft, BookmarkSimple, DotsThreeVertical, Trash } from "@phosphor-icons/react"
import { BottomNav } from "@/components/BottomNav"
import { listsApi } from "./api"
import { ProductPicker } from "./ProductPicker"
import { ListItemRow } from "./ListItemRow"
import { SaveAsTemplateDialog } from "@/features/templates/SaveAsTemplateDialog"
import { categoriesApi } from "@/features/categories/api"
import type { Category } from "@/features/categories/types"

function findCategory(cats: Category[], id: string): Category | undefined {
  for (const c of cats) {
    if (c.id === id) return c
    const sub = findCategory(c.subcategories ?? [], id)
    if (sub) return sub
  }
  return undefined
}

export function ListView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [saveTplOpen, setSaveTplOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ["lists", "detail", id],
    queryFn: () => listsApi.get(id!),
    enabled: !!id,
  })

  const catsQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  })

  const archive = useMutation({
    mutationFn: () => listsApi.update(id!, { archived: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists"] })
      navigate("/lists")
    },
  })

  const del = useMutation({
    mutationFn: () => listsApi.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists"] })
      navigate("/lists")
    },
  })

  const rename = useMutation({
    mutationFn: (name: string) => listsApi.update(id!, { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  })

  if (listQuery.isLoading) {
    return (
      <div className="min-h-screen pb-28 p-6 bg-surface-bg text-ink">
        Betöltés…
        <BottomNav />
      </div>
    )
  }
  const list = listQuery.data
  if (!list) {
    return (
      <div className="min-h-screen pb-28 p-6 bg-surface-bg text-ink">
        Nincs ilyen lista.
        <BottomNav />
      </div>
    )
  }

  const active = list.items.filter((i) => !i.isCompleted)
  const done = list.items.filter((i) => i.isCompleted)
  const currentName = nameDraft ?? list.name
  const meta = `${list.items.length} tétel · ${active.length} nyitva`
  const category = catsQuery.data ? findCategory(catsQuery.data, list.categoryId) : undefined
  const completedLabel = category?.completedLabel ?? "Kész"

  return (
    <div className="flex flex-col min-h-screen bg-surface-bg text-ink">
      <header className="shrink-0 bg-surface-bg z-10">
        <div className="flex items-center gap-0.5 min-h-14 px-1.5">
          <button
            type="button"
            aria-label="Vissza"
            onClick={() => navigate("/lists")}
            className="grid place-items-center size-12 rounded-3xl text-ink hover:bg-surface-raised transition"
          >
            <ArrowLeft size={22} weight="duotone" />
          </button>
          <div className="flex-1 min-w-0 flex flex-col">
            <input
              className="bg-transparent text-[19px] leading-tight font-medium tracking-tight outline-none px-1"
              value={currentName}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={(e) => {
                const next = e.target.value.trim()
                if (next && next !== list.name) rename.mutate(next)
                setNameDraft(null)
              }}
              aria-label="Lista neve"
            />
            <span className="text-xs text-ink-muted px-1">{meta}</span>
          </div>
          <button
            type="button"
            aria-label="Sablonként mentés"
            onClick={() => setSaveTplOpen(true)}
            className="grid place-items-center size-12 rounded-3xl text-ink hover:bg-surface-raised transition"
          >
            <BookmarkSimple size={22} weight="duotone" />
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
        <div className="px-3 pb-3">
          <ProductPicker listId={list.id} categoryId={list.categoryId} />
        </div>
      </header>

      <main className="flex-1 pb-28">
        <ul>
          {active.map((i) => (
            <ListItemRow key={i.id} listId={list.id} item={i} completedLabel={completedLabel} />
          ))}
        </ul>
        {done.length > 0 && (
          <>
            <div className="px-5 pt-4 pb-2 text-[12.5px] font-medium text-ink-muted">
              {done.length} kész
            </div>
            <ul>
              {done.map((i) => (
                <ListItemRow key={i.id} listId={list.id} item={i} completedLabel={completedLabel} />
              ))}
            </ul>
          </>
        )}
      </main>

      {saveTplOpen && (
        <SaveAsTemplateDialog
          sourceListId={list.id}
          categoryId={list.categoryId}
          onClose={() => setSaveTplOpen(false)}
        />
      )}

      {menuOpen && (
        <ListMenuSheet
          onClose={() => setMenuOpen(false)}
          onArchive={() => { setMenuOpen(false); archive.mutate() }}
          onDelete={() => {
            if (confirm("Biztos törlöd a listát?")) { setMenuOpen(false); del.mutate() }
          }}
        />
      )}

      <BottomNav />
    </div>
  )
}

function ListMenuSheet({
  onClose, onArchive, onDelete
}: {
  onClose: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full rounded-t-3xl bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-1"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-line" />
        <button
          type="button"
          onClick={onArchive}
          className="w-full flex items-center gap-3 min-h-14 px-4 rounded-2xl hover:bg-surface-raised text-left"
        >
          <Archive size={22} weight="duotone" className="text-ink-muted" />
          <span className="text-[15px]">Archiválás</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-full flex items-center gap-3 min-h-14 px-4 rounded-2xl hover:bg-danger-soft text-left text-danger"
        >
          <Trash size={22} weight="duotone" />
          <span className="text-[15px]">Törlés</span>
        </button>
      </div>
    </div>
  )
}
