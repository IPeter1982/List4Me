import { useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BookmarkSimple, Plus } from "@phosphor-icons/react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { categoriesApi } from "@/features/categories/api"
import { getIcon } from "@/lib/icons"
import type { Category } from "@/features/categories/types"
import { templatesApi } from "@/features/templates/api"
import { cn } from "@/lib/cn"
import { listsApi } from "./api"

type Props = { onClose: () => void; presetCategoryId?: string }
type Mode = "empty" | "template"

function flatten(cats: Category[]): { id: string; name: string; iconKey: string; indent: boolean }[] {
  const out: { id: string; name: string; iconKey: string; indent: boolean }[] = []
  for (const c of cats) {
    out.push({ id: c.id, name: c.name, iconKey: c.iconKey, indent: false })
    for (const s of c.subcategories ?? []) {
      out.push({ id: s.id, name: s.name, iconKey: s.iconKey, indent: true })
    }
  }
  return out
}

export function NewListDialog({ onClose, presetCategoryId }: Props) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState(presetCategoryId ?? "")
  const [mode, setMode] = useState<Mode>("empty")
  const [templateId, setTemplateId] = useState<string>("")

  const catQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    enabled: !presetCategoryId,
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

  const flatCats = catQuery.data ? flatten(catQuery.data) : []
  const canCreate =
    !!name.trim() &&
    !!categoryId &&
    (mode === "empty" || !!templateId) &&
    !create.isPending

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle>Új lista</SheetTitle>
        <p className="text-[13.5px] text-ink-muted mt-1 mb-4">
          Válassz kezdést, és add meg a lista nevét.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2.5">
            <ModeCard
              active={mode === "empty"}
              onClick={() => { setMode("empty"); setTemplateId("") }}
              icon={<Plus size={24} weight="duotone" />}
              name="Üres"
              sub="Kezdd tiszta lappal"
            />
            <ModeCard
              active={mode === "template"}
              onClick={() => setMode("template")}
              icon={<BookmarkSimple size={24} weight="duotone" />}
              name="Sablonból"
              sub="Mentett listából"
              disabled={!categoryId}
            />
          </div>

          {mode === "template" && (
            <div style={{ animation: "l4m-fade-in .18s ease" }}>
              {tplQuery.isLoading && <div className="text-ink-muted text-sm">Sablonok betöltése…</div>}
              {tplQuery.data && tplQuery.data.length === 0 && (
                <div className="text-ink-muted text-sm">Nincs sablon ebben a kategóriában.</div>
              )}
              {tplQuery.data && tplQuery.data.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tplQuery.data.map(t => {
                    const active = t.id === templateId
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplateId(t.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl border text-sm active:scale-95 transition",
                          active
                            ? "border-brand"
                            : "border-line bg-surface-raised text-ink"
                        )}
                        style={active ? { background: "var(--priCont)", color: "var(--priInk)" } : undefined}
                      >
                        <BookmarkSimple size={16} weight="duotone" />
                        {t.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {!presetCategoryId && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] text-ink-muted">Kategória</span>
              <div className="flex flex-wrap gap-2">
                {flatCats.map(c => {
                  const Icon = getIcon(c.iconKey)
                  const active = c.id === categoryId
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setCategoryId(c.id); if (mode === "template") setTemplateId("") }}
                      className={cn(
                        "inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl border text-sm transition",
                        c.indent && "ml-2",
                        active ? "border-brand" : "border-line bg-surface-raised text-ink"
                      )}
                      style={active ? { background: "var(--priCont)", color: "var(--priInk)" } : undefined}
                    >
                      <Icon size={16} weight="duotone" />
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-ink-muted">Lista neve</span>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="pl. Heti nagybevásárlás"
              className="min-h-14 px-4 rounded-2xl border border-line bg-surface-raised text-[16px] text-ink outline-none focus:border-brand"
            />
          </label>

          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[52px] rounded-[26px] border border-line text-[15px] font-medium text-ink active:bg-surface-raised"
            >
              Mégse
            </button>
            <button
              type="button"
              onClick={() => create.mutate()}
              disabled={!canCreate}
              className="flex-[1.4] min-h-[52px] rounded-[26px] bg-brand text-brand-on text-[15px] font-medium disabled:opacity-60 active:scale-[.98]"
            >
              Létrehozás
            </button>
          </div>
          {create.isError && <p className="text-danger text-sm">Hiba: {(create.error as Error).message}</p>}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ModeCard({
  active, disabled, onClick, icon, name, sub
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
  name: string
  sub: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex flex-col items-start gap-1.5 min-h-24 p-3.5 rounded-[18px] border-[1.5px] text-left transition",
        active ? "border-brand" : "border-line bg-surface-raised",
        disabled && "opacity-50"
      )}
      style={active ? { background: "var(--priCont)", color: "var(--priInk)" } : undefined}
    >
      {icon}
      <span className="text-[15px] font-medium">{name}</span>
      <span className="text-xs opacity-75">{sub}</span>
    </button>
  )
}
