import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { PageShell } from "@/components/PageShell"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api"
import { categoriesApi } from "./api"
import type { Category } from "./types"
import { CategoryCard } from "./CategoryCard"
import { CategoryEditor } from "./CategoryEditor"

export function CategoryListScreen() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["categories"], queryFn: categoriesApi.list
  })
  const [editing, setEditing] = useState<Category | undefined>()
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Category | undefined>()

  const del = useMutation({
    mutationFn: (payload: { id: string; force: boolean }) =>
      categoriesApi.remove(payload.id, payload.force),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setSelected(undefined) }
  })

  return (
    <PageShell title="Kategóriák">
      {isLoading && <div className="text-neutral-500">Betöltés…</div>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {data.map(c => (
              <CategoryCard key={c.id} category={c} onClick={() => setSelected(c)} />
            ))}
          </div>

          <button
            onClick={() => setCreating(true)}
            className="fixed bottom-24 right-4 z-20 size-14 rounded-full bg-brand text-white
                       shadow-lg flex items-center justify-center hover:bg-blue-700"
            aria-label="Új kategória"
          >
            <Plus className="size-6" />
          </button>
        </>
      )}

      {creating && (
        <CategoryEditor open={creating} onOpenChange={setCreating} parentCategoryId={null} />
      )}

      {selected && (
        <SelectedCategoryDrawer
          category={selected}
          onClose={() => { del.reset(); setSelected(undefined) }}
          onEdit={() => { del.reset(); setEditing(selected); setSelected(undefined) }}
          onDelete={(force) => del.mutate({ id: selected.id, force })}
          deleteError={del.error instanceof ApiError ? del.error : null}
        />
      )}

      {editing && (
        <CategoryEditor
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(undefined)}
          category={editing}
        />
      )}
    </PageShell>
  )
}

function SelectedCategoryDrawer({
  category, onClose, onEdit, onDelete, deleteError
}: {
  category: Category
  onClose: () => void
  onEdit: () => void
  onDelete: (force: boolean) => void
  deleteError: ApiError | null
}) {
  const [confirmForce, setConfirmForce] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/40 z-40 grid place-items-end" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="selected-category-title"
        className="bg-white w-full rounded-t-2xl p-4 space-y-3 dark:bg-neutral-900
                   pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="selected-category-title" className="text-lg font-semibold">{category.name}</h3>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onEdit} className="flex-1">
            <Pencil className="size-4 mr-2" /> Szerkeszt
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmForce) onDelete(true)
              else onDelete(false)
            }}
            className="flex-1"
          >
            <Trash2 className="size-4 mr-2" />
            {confirmForce ? "Igen, törlés" : "Törlés"}
          </Button>
        </div>
        {deleteError?.status === 409 && !confirmForce && (
          <p className="text-sm text-neutral-600">
            A kategória nem üres. Ha biztosan törölnéd, koppints újra a Törlés-re
            (alkategóriák és termékek is törlődnek).
            <button
              type="button"
              className="block text-brand mt-2"
              onClick={() => setConfirmForce(true)}
            >Kaszkádolt törlés bekapcsolása</button>
          </p>
        )}
      </div>
    </div>
  )
}
