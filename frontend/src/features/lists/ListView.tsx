import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Archive, ArrowLeft, BookmarkSimple, Trash } from "@phosphor-icons/react"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { listsApi } from "./api"
import { ProductPicker } from "./ProductPicker"
import { ListItemRow } from "./ListItemRow"
import { SaveAsTemplateDialog } from "@/features/templates/SaveAsTemplateDialog"

export function ListView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [saveTplOpen, setSaveTplOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ["lists", "detail", id],
    queryFn: () => listsApi.get(id!),
    enabled: !!id,
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
      <div className="min-h-screen pb-20 p-6">
        Betöltés…
        <BottomNav />
      </div>
    )
  }
  const list = listQuery.data
  if (!list) {
    return (
      <div className="min-h-screen pb-20 p-6">
        Nincs ilyen lista.
        <BottomNav />
      </div>
    )
  }

  const active = list.items.filter((i) => !i.isCompleted)
  const done = list.items.filter((i) => i.isCompleted)
  const currentName = nameDraft ?? list.name

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b dark:bg-neutral-900/90">
        <div className="flex items-center gap-1 px-2 py-2">
          <Button
            variant="ghost"
            aria-label="Vissza"
            onClick={() => navigate("/lists")}
            className="size-11 p-0"
          >
            <ArrowLeft size={20} weight="duotone" />
          </Button>
          <input
            className="flex-1 bg-transparent text-lg font-semibold outline-none px-1 min-h-11"
            value={currentName}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={(e) => {
              const next = e.target.value.trim()
              if (next && next !== list.name) rename.mutate(next)
              setNameDraft(null)
            }}
            aria-label="Lista neve"
          />
          <Button variant="ghost" aria-label="Sablonként mentés" onClick={() => setSaveTplOpen(true)} className="size-11 p-0">
            <BookmarkSimple size={20} weight="duotone" />
          </Button>
          <Button variant="ghost" aria-label="Archiválás" onClick={() => archive.mutate()} className="size-11 p-0">
            <Archive size={20} weight="duotone" />
          </Button>
          <Button
            variant="ghost"
            aria-label="Törlés"
            onClick={() => {
              if (confirm("Biztos törlöd a listát?")) del.mutate()
            }}
            className="size-11 p-0 text-danger"
          >
            <Trash size={20} weight="duotone" />
          </Button>
        </div>
        <div className="px-3 py-2 border-t bg-white dark:bg-neutral-900">
          <ProductPicker listId={list.id} categoryId={list.categoryId} />
        </div>
      </header>

      <main className="px-2 py-2">
        <ul className="divide-y">
          {active.map((i) => (
            <ListItemRow key={i.id} listId={list.id} item={i} />
          ))}
        </ul>
        {done.length > 0 && (
          <>
            <div className="px-3 py-2 mt-2 text-xs font-medium text-neutral-500">Kész</div>
            <ul className="divide-y">
              {done.map((i) => (
                <ListItemRow key={i.id} listId={list.id} item={i} />
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

      <BottomNav />
    </div>
  )
}
