import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SwipeableRow } from "@/components/SwipeableRow"
import { useUndoQueue } from "@/shared/useUndoQueue"
import { listItemsApi } from "./api"
import type { ListDetailDto, ListItemDto } from "./types"
import { ExpiryBadge } from "./ExpiryBadge"
import { ItemDetailsModal } from "./ItemDetailsModal"

type Props = { listId: string; item: ListItemDto }

export function ListItemRow({ listId, item }: Props) {
  const qc = useQueryClient()
  const push = useUndoQueue((s) => s.push)
  const [showDetails, setShowDetails] = useState(false)
  const longPressTimer = useRef<number | null>(null)

  const setLocal = (fn: (l: ListDetailDto) => ListDetailDto) => {
    qc.setQueryData<ListDetailDto>(["lists", "detail", listId], (l) => (l ? fn(l) : l))
  }

  const complete = useMutation({
    mutationFn: () => listItemsApi.complete(listId, item.id),
    onMutate: async () => {
      setLocal((l) => ({
        ...l,
        items: l.items.map((i) =>
          i.id === item.id
            ? { ...i, isCompleted: true, completedAt: new Date().toISOString() }
            : i,
        ),
      }))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["lists", "detail", listId] }),
  })

  const uncomplete = useMutation({
    mutationFn: () => listItemsApi.uncomplete(listId, item.id),
    onMutate: async () => {
      setLocal((l) => ({
        ...l,
        items: l.items.map((i) =>
          i.id === item.id ? { ...i, isCompleted: false, completedAt: null } : i,
        ),
      }))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["lists", "detail", listId] }),
  })

  const handleSwipeLeft = () => {
    // Optimistically hide.
    setLocal((l) => ({ ...l, items: l.items.filter((i) => i.id !== item.id) }))
    push({
      label: `Törölve: ${item.productName}`,
      onCommit: () =>
        listItemsApi.remove(listId, item.id).finally(() =>
          qc.invalidateQueries({ queryKey: ["lists", "detail", listId] }),
        ),
      onUndo: () => qc.invalidateQueries({ queryKey: ["lists", "detail", listId] }),
    })
  }

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <>
      <SwipeableRow
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={item.isCompleted ? undefined : () => complete.mutate()}
      >
        <div
          className={
            "flex items-center gap-2 px-3 py-3 " +
            (item.isCompleted ? "text-neutral-500 line-through" : "")
          }
          onClick={() => item.isCompleted && uncomplete.mutate()}
          onPointerDown={() => {
            clearLongPress()
            longPressTimer.current = window.setTimeout(() => setShowDetails(true), 500)
          }}
          onPointerUp={clearLongPress}
          onPointerCancel={clearLongPress}
          onPointerLeave={clearLongPress}
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{item.productName}</div>
            {(item.quantity || item.unit || item.note) && (
              <div className="text-xs text-neutral-500 truncate">
                {item.quantity ?? ""} {item.unit ?? ""}{item.note && ` — ${item.note}`}
              </div>
            )}
          </div>
          <ExpiryBadge expiresOn={item.expiresOn} />
        </div>
      </SwipeableRow>

      {showDetails && (
        <ItemDetailsModal
          listId={listId}
          item={item}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  )
}
