import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CaretDown, CaretRight, Trash } from "@phosphor-icons/react"
import { PageShell } from "@/components/PageShell"
import { Button } from "@/components/ui/button"
import { templatesApi } from "./api"

export function TemplatesList() {
  const qc = useQueryClient()
  const [openId, setOpenId] = useState<string | null>(null)

  const tplQuery = useQuery({
    queryKey: ["templates"],
    queryFn: () => templatesApi.list(),
  })

  const detailQuery = useQuery({
    queryKey: ["templates", "detail", openId],
    queryFn: () => templatesApi.get(openId!),
    enabled: !!openId,
  })

  const del = useMutation({
    mutationFn: (id: string) => templatesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  })

  return (
    <PageShell title="Sablonok">
      {tplQuery.isLoading && <div className="text-neutral-500">Betöltés…</div>}
      {tplQuery.data && tplQuery.data.length === 0 && (
        <p className="p-6 text-center text-neutral-500">
          Még nincs sablon. Nyisd meg egy listát és „Sablonként" gomb.
        </p>
      )}
      <ul className="divide-y rounded-xl border bg-white dark:bg-neutral-900">
        {tplQuery.data?.map((t) => (
          <li key={t.id}>
            <div className="flex items-center gap-2 px-3 py-3">
              <button
                type="button"
                className="flex flex-1 items-center gap-2 text-left"
                onClick={() => setOpenId(openId === t.id ? null : t.id)}
                aria-expanded={openId === t.id}
              >
                {openId === t.id ? (
                  <CaretDown size={16} weight="duotone" />
                ) : (
                  <CaretRight size={16} weight="duotone" />
                )}
                <span className="flex-1 font-medium">{t.name}</span>
                <span className="text-sm text-neutral-500">{t.itemCount} tétel</span>
              </button>
              <Button
                variant="ghost"
                className="size-11 p-0 text-danger"
                aria-label={`${t.name} sablon törlése`}
                onClick={() => {
                  if (confirm(`Törli: ${t.name}?`)) del.mutate(t.id)
                }}
              >
                <Trash size={16} weight="duotone" />
              </Button>
            </div>
            {openId === t.id && detailQuery.data && (
              <ul className="border-t bg-neutral-50 dark:bg-neutral-800 pb-2">
                {detailQuery.data.items.map((i) => (
                  <li key={i.id} className="px-6 py-1 text-sm">
                    • {i.productName}
                    {(i.quantity || i.unit) && (
                      <span className="text-neutral-500">
                        {" — "}
                        {i.quantity ?? ""} {i.unit ?? ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
