import { Star } from "@phosphor-icons/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { productsApi } from "./api"
import type { ProductDto } from "./types"

type Props = {
  productId: string
  isFavorite: boolean
  categoryId: string
}

export function FavoriteChip({ productId, isFavorite, categoryId }: Props) {
  const qc = useQueryClient()
  const toggle = useMutation({
    mutationFn: () => (isFavorite ? productsApi.unfavorite(productId) : productsApi.favorite(productId)),
    onMutate: async () => {
      // Optimistic — flip every cached ProductDto with this id.
      const snapshots = qc.getQueriesData<ProductDto[]>({ queryKey: ["products"] })
      snapshots.forEach(([key, list]) => {
        if (!list) return
        qc.setQueryData<ProductDto[]>(
          key,
          list.map((p) => (p.id === productId ? { ...p, isFavorite: !isFavorite } : p)),
        )
      })
      return { snapshots }
    },
    onError: (_e, _v, ctx) => {
      ctx?.snapshots.forEach(([key, list]) => qc.setQueryData(key, list))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["products", categoryId] }),
  })

  return (
    <button
      type="button"
      aria-label={isFavorite ? "Kedvencből eltávolítás" : "Kedvencnek jelöl"}
      onClick={() => toggle.mutate()}
      className="p-2 text-neutral-400"
    >
      <Star size={20} weight={isFavorite ? "fill" : "duotone"} className={isFavorite ? "text-yellow-400" : ""} />
    </button>
  )
}
