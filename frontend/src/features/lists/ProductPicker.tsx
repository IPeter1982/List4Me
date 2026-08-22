import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, MagnifyingGlass, Star } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { productsApi } from "@/features/products/api"
import type { ProductDto } from "@/features/products/types"
import { listItemsApi } from "./api"

type Props = { listId: string; categoryId: string }

export function ProductPicker({ listId, categoryId }: Props) {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 200)
    return () => clearTimeout(t)
  }, [q])

  const searchQuery = useQuery({
    queryKey: ["products", categoryId, debouncedQ, "picker"],
    queryFn: () => productsApi.list({ categoryId, q: debouncedQ }),
    enabled: !!categoryId && debouncedQ.length > 0,
  })

  const favQuery = useQuery({
    queryKey: ["products", categoryId, "favorites"],
    queryFn: () => productsApi.list({ categoryId, favoritesOnly: true }),
    enabled: !!categoryId && q.length === 0,
  })

  const add = useMutation({
    mutationFn: (productId: string) =>
      listItemsApi.add(listId, {
        productId, quantity: null, unit: null, expiresOn: null, note: null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "detail", listId] })
      setQ("")
      inputRef.current?.focus()
    },
  })

  const createAndAdd = useMutation({
    mutationFn: async (name: string) => {
      const product = await productsApi.create(categoryId, {
        name, defaultQuantity: null, defaultUnit: null,
      })
      return listItemsApi.add(listId, {
        productId: product.id, quantity: null, unit: null, expiresOn: null, note: null,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "detail", listId] })
      qc.invalidateQueries({ queryKey: ["products", categoryId] })
      setQ("")
      inputRef.current?.focus()
    },
  })

  const results = searchQuery.data ?? []
  const showCreate =
    debouncedQ.length > 0 &&
    !results.some((r) => r.name.toLowerCase() === debouncedQ.toLowerCase())

  return (
    <div>
      <div className="relative">
        <MagnifyingGlass size={16} weight="duotone" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          ref={inputRef}
          className="pl-9"
          placeholder="Termék hozzáadása…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Termék hozzáadása"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (results.length > 0) {
                e.preventDefault()
                add.mutate(results[0].id)
              } else if (showCreate) {
                e.preventDefault()
                createAndAdd.mutate(debouncedQ)
              }
            }
          }}
        />
      </div>

      {q.length === 0 && (favQuery.data?.length ?? 0) > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {favQuery.data!.slice(0, 8).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => add.mutate(p.id)}
              className="inline-flex items-center gap-1 rounded-full border bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
            >
              <Star size={12} weight="fill" className="text-yellow-400" />
              {p.name}
            </button>
          ))}
        </div>
      )}

      {q.length > 0 && (
        <ul className="mt-1 max-h-64 divide-y overflow-y-auto rounded-lg border bg-white dark:bg-neutral-900 shadow">
          {results.map((r) => (
            <PickerRow key={r.id} p={r} onPick={() => add.mutate(r.id)} />
          ))}
          {showCreate && (
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => createAndAdd.mutate(debouncedQ)}
              >
                <Plus size={16} weight="duotone" />
                Új termék: „{debouncedQ}"
              </button>
            </li>
          )}
          {!showCreate && results.length === 0 && !searchQuery.isFetching && (
            <li className="p-2 text-sm text-neutral-500">Nincs találat.</li>
          )}
        </ul>
      )}
    </div>
  )
}

function PickerRow({ p, onPick }: { p: ProductDto; onPick: () => void }) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
        onClick={onPick}
      >
        <span className="flex-1">{p.name}</span>
        {(p.defaultQuantity || p.defaultUnit) && (
          <span className="text-xs text-neutral-500">
            {p.defaultQuantity ?? ""} {p.defaultUnit ?? ""}
          </span>
        )}
      </button>
    </li>
  )
}
