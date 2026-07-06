import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { productsApi } from "./api"
import type { ProductDto } from "./types"

type Props = {
  categoryId: string
  product: ProductDto | null
  onClose: () => void
}

export function ProductEditor({ categoryId, product, onClose }: Props) {
  const qc = useQueryClient()
  const [name, setName] = useState(product?.name ?? "")
  const [qty, setQty] = useState(product?.defaultQuantity?.toString() ?? "")
  const [unit, setUnit] = useState(product?.defaultUnit ?? "")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(product?.name ?? "")
    setQty(product?.defaultQuantity?.toString() ?? "")
    setUnit(product?.defaultUnit ?? "")
    setError(null)
  }, [product])

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: name.trim(),
        defaultQuantity: qty ? Number(qty) : null,
        defaultUnit: unit.trim() || null,
      }
      return product
        ? productsApi.update(product.id, body)
        : productsApi.create(categoryId, body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", categoryId] })
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>{product ? "Termék szerkesztése" : "Új termék"}</DialogTitle>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <label className="block">
            <span className="mb-1 block text-sm">Név</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-sm">Alap mennyiség</span>
              <Input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm">Mértékegység</span>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="db, kg, l…" />
            </label>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Mégse
            </Button>
            <Button type="submit" disabled={!name.trim() || save.isPending}>
              {product ? "Mentés" : "Létrehozás"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
