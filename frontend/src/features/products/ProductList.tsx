import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Plus, Search, Star } from "lucide-react"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { productsApi } from "./api"
import type { ProductDto } from "./types"
import { ProductEditor } from "./ProductEditor"
import { FavoriteChip } from "./FavoriteChip"

export function ProductList() {
  const { id: categoryId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [favOnly, setFavOnly] = useState(false)
  const [editing, setEditing] = useState<ProductDto | "new" | null>(null)

  const productsQuery = useQuery({
    queryKey: ["products", categoryId, q, favOnly],
    queryFn: () => productsApi.list({ categoryId: categoryId!, q, favoritesOnly: favOnly }),
    enabled: !!categoryId,
  })

  const del = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", categoryId] }),
  })

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b dark:bg-neutral-900/90">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            aria-label="Vissza"
            onClick={() => navigate(-1)}
            className="size-11 p-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="pl-9"
              placeholder="Termék keresése…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Termék keresése"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-3">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setFavOnly((v) => !v)}
            className={
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm " +
              (favOnly ? "bg-brand text-white border-brand" : "bg-white dark:bg-neutral-900")
            }
          >
            <Star className={"size-4 " + (favOnly ? "fill-current" : "")} />
            Kedvencek
          </button>
        </div>

        {productsQuery.isLoading && <div className="text-neutral-500">Betöltés…</div>}

        {productsQuery.data && productsQuery.data.length === 0 && (
          <p className="p-6 text-center text-neutral-500">
            Nincs termék ebben a kategóriában. Adj hozzá egyet a + gombbal.
          </p>
        )}

        <ul className="divide-y">
          {productsQuery.data?.map((p) => (
            <li key={p.id} className="flex items-center gap-2 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                {(p.defaultQuantity || p.defaultUnit) && (
                  <div className="text-sm text-neutral-500">
                    {p.defaultQuantity ?? ""} {p.defaultUnit ?? ""}
                  </div>
                )}
              </div>
              <FavoriteChip productId={p.id} isFavorite={p.isFavorite} categoryId={categoryId!} />
              <Button
                variant="ghost"
                className="px-3"
                onClick={() => setEditing(p)}
              >
                Szerk.
              </Button>
              <Button
                variant="ghost"
                className="px-3 text-danger"
                onClick={() => {
                  if (confirm(`Törli: ${p.name}?`)) del.mutate(p.id)
                }}
                disabled={del.isPending}
              >
                Törlés
              </Button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label="Új termék"
          onClick={() => setEditing("new")}
          className="fixed bottom-24 right-4 z-20 size-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-blue-700"
        >
          <Plus className="size-6" />
        </button>
      </main>

      {editing !== null && (
        <ProductEditor
          categoryId={categoryId!}
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}
