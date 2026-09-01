import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
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
        await categoriesApi.update(category!.id, { name, iconKey, completedLabel })
      } else {
        await categoriesApi.create({
          name, iconKey, completedLabel,
          parentCategoryId: parentCategoryId ?? null,
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      onOpenChange(false)
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle>{isEdit ? "Kategória szerkesztése" : "Új kategória"}</SheetTitle>
        <p className="text-[13.5px] text-ink-muted mt-1 mb-4">
          Válassz ikont, adj nevet, és jelöld meg a „készre" címkét.
        </p>

        <div className="flex flex-col gap-4">
          <IconPicker value={iconKey} onChange={setIconKey} />

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-ink-muted">Kategória neve</span>
            <input
              autoFocus={!isEdit}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="pl. Kamra"
              className="min-h-14 px-4 rounded-2xl border border-line bg-surface-raised text-[16px] text-ink outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-ink-muted">„Készre jelölve" címke</span>
            <input
              value={completedLabel}
              onChange={e => setCompletedLabel(e.target.value)}
              placeholder="Pl. Megvettem / Elfogyott / Bepakolva"
              className="min-h-14 px-4 rounded-2xl border border-line bg-surface-raised text-[16px] text-ink outline-none focus:border-brand"
            />
          </label>

          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 min-h-[52px] rounded-[26px] border border-line text-[15px] font-medium text-ink active:bg-surface-raised"
            >
              Mégse
            </button>
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={!name.trim() || save.isPending}
              className="flex-[1.4] min-h-[52px] rounded-[26px] bg-brand text-brand-on text-[15px] font-medium disabled:opacity-60 active:scale-[.98]"
            >
              {isEdit ? "Mentés" : "Létrehozás"}
            </button>
          </div>
          {save.isError && <p className="text-danger text-sm">Hiba: {(save.error as Error).message}</p>}
        </div>
      </SheetContent>
    </Sheet>
  )
}
