import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listItemsApi } from "./api"
import type { ListItemDto } from "./types"

type Props = { listId: string; item: ListItemDto; onClose: () => void }

export function ItemDetailsModal({ listId, item, onClose }: Props) {
  const qc = useQueryClient()
  const [qty, setQty] = useState(item.quantity?.toString() ?? "")
  const [unit, setUnit] = useState(item.unit ?? "")
  const [exp, setExp] = useState(item.expiresOn ?? "")
  const [note, setNote] = useState(item.note ?? "")

  const save = useMutation({
    mutationFn: () =>
      listItemsApi.update(listId, item.id, {
        quantity: qty ? Number(qty) : null,
        unit: unit || null,
        expiresOn: exp || null,
        note: note || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "detail", listId] })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>{item.productName}</DialogTitle>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-sm">Mennyiség</span>
              <Input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm">Egység</span>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm">Lejárat</span>
            <Input type="date" value={exp} onChange={(e) => setExp(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm">Jegyzet</span>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Mégse</Button>
            <Button type="submit" disabled={save.isPending}>Mentés</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
