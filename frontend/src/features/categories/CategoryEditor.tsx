import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconPicker } from "./IconPicker"
import { categoriesApi } from "./api"
import type { Category } from "./types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  parentCategoryId?: string | null
}

export function CategoryEditor({ open, onOpenChange, category, parentCategoryId }: Props) {
  const qc = useQueryClient()
  const isEdit = !!category
  const [name, setName] = useState(category?.name ?? "")
  const [iconKey, setIconKey] = useState(category?.iconKey ?? "shopping-cart")
  const [completedLabel, setCompletedLabel] = useState(category?.completedLabel ?? "Kész")

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setIconKey(category?.iconKey ?? "shopping-cart")
      setCompletedLabel(category?.completedLabel ?? "Kész")
    }
  }, [open, category])

  const save = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        await categoriesApi.update(category!.id, {
          name, iconKey, completedLabel
        })
      } else {
        await categoriesApi.create({
          name, iconKey, completedLabel,
          parentCategoryId: parentCategoryId ?? null
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      onOpenChange(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{isEdit ? "Kategória szerkesztése" : "Új kategória"}</DialogTitle>
        <div className="space-y-3">
          <div>
            <label htmlFor="category-name" className="block text-sm mb-1">Név</label>
            <Input id="category-name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Ikon</label>
            <IconPicker value={iconKey} onChange={setIconKey} />
          </div>
          <div>
            <label htmlFor="category-completed-label" className="block text-sm mb-1">"Készre jelölve" címke</label>
            <Input id="category-completed-label" value={completedLabel} onChange={e => setCompletedLabel(e.target.value)}
                   placeholder="Pl. Megvettem / Elfogyott / Bepakolva" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">Mégse</Button>
            <Button
              onClick={() => save.mutate()}
              disabled={!name.trim() || save.isPending}
              className="flex-1"
            >{isEdit ? "Mentés" : "Létrehoz"}</Button>
          </div>
          {save.isError && <p className="text-danger text-sm">Hiba: {(save.error as Error).message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
