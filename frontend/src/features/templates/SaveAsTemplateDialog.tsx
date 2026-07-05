import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { templatesApi } from "./api"

type Props = { sourceListId: string; categoryId: string; onClose: () => void }

export function SaveAsTemplateDialog({ sourceListId, categoryId, onClose }: Props) {
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const save = useMutation({
    mutationFn: () =>
      templatesApi.create({
        name: name.trim(),
        categoryId,
        sourceListId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] })
      onClose()
    },
  })
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>Mentés sablonként</DialogTitle>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <label className="block">
            <span className="mb-1 block text-sm">Sablon neve</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Mégse</Button>
            <Button type="submit" disabled={!name.trim() || save.isPending}>Mentés</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
