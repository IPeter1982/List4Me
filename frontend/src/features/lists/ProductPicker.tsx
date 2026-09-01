import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, MagnifyingGlass, Star, XCircle } from "@phosphor-icons/react"
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
  const favs = favQuery.data ?? []

  return (
    <div>
      <div className="flex items-center gap-2.5 min-h-[52px] px-4 rounded-[26px] bg-surface-raised">
        <MagnifyingGlass size={20} weight="duotone" className="text-ink-muted shrink-0" />
        <input
          ref={inputRef}
          className="flex-1 min-w-0 h-12 bg-transparent border-0 outline-none text-[15px] text-ink placeholder:text-ink-muted"
          placeholder="Termék keresése vagy hozzáadása"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Termék keresése vagy hozzáadása"
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
        {q.length > 0 && (
          <button
            type="button"
            aria-label="Törlés"
            onClick={() => { setQ(""); inputRef.current?.focus() }}
            className="grid place-items-center size-9 rounded-full text-ink-muted shrink-0"
          >
            <XCircle size={19} weight="duotone" />
          </button>
        )}
      </div>

      {q.length === 0 && favs.length > 0 && (
        <div className="mt-3">
          <div className="text-[12.5px] font-medium text-ink-muted mb-2 px-1">Kedvencek</div>
          <div className="flex flex-wrap gap-2">
            {favs.slice(0, 12).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => add.mutate(p.id)}
                className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl text-sm active:scale-95 transition"
                style={{ background: "var(--priCont)", color: "var(--priInk)" }}
              >
                <Star size={16} weight="fill" />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {q.length > 0 && (
        <div className="mt-3 rounded-2xl bg-surface overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          <ul>
            {results.map((r) => (
              <PickerRow key={r.id} p={r} onPick={() => add.mutate(r.id)} />
            ))}
            {showCreate && (
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-3.5 min-h-13 px-4 text-left active:bg-surface-raised"
                  onClick={() => createAndAdd.mutate(debouncedQ)}
                >
                  <Plus size={20} weight="duotone" className="text-brand" />
                  <span className="flex-1 text-[15px]">Új termék: „{debouncedQ}"</span>
                </button>
              </li>
            )}
            {!showCreate && results.length === 0 && !searchQuery.isFetching && (
              <li className="p-3 text-sm text-ink-muted">Nincs találat.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function PickerRow({ p, onPick }: { p: ProductDto; onPick: () => void }) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-3.5 min-h-13 px-4 text-left active:bg-surface-raised"
        onClick={onPick}
      >
        <span className="flex-1 text-[15px]">{p.name}</span>
        {(p.defaultQuantity || p.defaultUnit) && (
          <span className="text-xs text-ink-muted">
            {p.defaultQuantity ?? ""} {p.defaultUnit ?? ""}
          </span>
        )}
      </button>
    </li>
  )
}
