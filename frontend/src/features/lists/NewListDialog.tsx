import { useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categoriesApi } from "@/features/categories/api"
import type { Category } from "@/features/categories/types"
import { templatesApi } from "@/features/templates/api"
import { listsApi } from "./api"

type Props = { onClose: () => void; presetCategoryId?: string }

function flatten(cats: Category[]): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = []
  for (const c of cats) {
    out.push({ id: c.id, label: c.name })
    for (const s of c.subcategories ?? []) {
      out.push({ id: s.id, label: `  ${s.name}` })
    }
  }
  return out
}

export function NewListDialog({ onClose, presetCategoryId }: Props) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState(presetCategoryId ?? "")
  const [mode, setMode] = useState<"empty" | "template">("empty")
  const [templateId, setTemplateId] = useState<string>("")

  const catQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  })
  const tplQuery = useQuery({
    queryKey: ["templates", { categoryId }],
    queryFn: () => templatesApi.list({ categoryId }),
    enabled: !!categoryId && mode === "template",
  })

  const create = useMutation({
    mutationFn: () => listsApi.create({
      name: name.trim(),
      categoryId,
      fromTemplateId: mode === "template" ? (templateId || null) : null,
    }),
    onSuccess: (list) => {
      qc.invalidateQueries({ queryKey: ["lists"] })
      onClose()
      navigate(`/lists/${list.id}`)
    },
  })

  const flatCats = flatten(catQuery.data ?? [])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>Új lista</DialogTitle>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
        >
          <label className="block">
            <span className="mb-1 block text-sm">Név</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Kategória</span>
            <select
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm min-h-11"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Válassz…</option>
              {flatCats.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <fieldset className="rounded-lg border p-3">
            <legend className="px-1 text-sm">Kezdés</legend>
            <label className="flex items-center gap-2 py-1">
              <input
                type="radio"
                checked={mode === "empty"}
                onChange={() => setMode("empty")}
              />
              Üres
            </label>
            <label className="flex items-center gap-2 py-1">
              <input
                type="radio"
                checked={mode === "template"}
                onChange={() => setMode("template")}
                disabled={!categoryId}
              />
              Sablonból
            </label>
            {mode === "template" && (
              <select
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm min-h-11"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                required
              >
                <option value="">Válassz sablont…</option>
                {tplQuery.data?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.itemCount})
                  </option>
                ))}
              </select>
            )}
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Mégse</Button>
            <Button
              type="submit"
              disabled={!name.trim() || !categoryId ||
                (mode === "template" && !templateId) || create.isPending}
            >
              Létrehozás
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
