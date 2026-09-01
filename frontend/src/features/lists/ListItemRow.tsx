import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckSquare, DotsSixVertical, Square } from "@phosphor-icons/react"
import { SwipeableRow } from "@/components/SwipeableRow"
import { useUndoQueue } from "@/shared/useUndoQueue"
import { listItemsApi } from "./api"
import type { ListDetailDto, ListItemDto } from "./types"
import { ExpiryBadge } from "./ExpiryBadge"
import { ItemDetailsModal } from "./ItemDetailsModal"

type Props = { listId: string; item: ListItemDto; completedLabel?: string }

export function ListItemRow({ listId, item, completedLabel }: Props) {
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

  const CheckboxIcon = item.isCompleted ? CheckSquare : Square

  return (
    <>
      <SwipeableRow
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={item.isCompleted ? undefined : () => complete.mutate()}
        rightLabel={completedLabel ?? "Kész"}
      >
        <div
          className="flex items-center gap-3.5 min-h-16 px-5 py-2.5"
          style={{ boxShadow: "inset 0 -1px 0 var(--line)" }}
          onPointerDown={() => {
            clearLongPress()
            longPressTimer.current = window.setTimeout(() => setShowDetails(true), 500)
          }}
          onPointerUp={clearLongPress}
          onPointerCancel={clearLongPress}
          onPointerLeave={clearLongPress}
        >
          <button
            type="button"
            aria-label={item.isCompleted ? "Visszaállítás" : "Kész"}
            onClick={(e) => {
              e.stopPropagation()
              if (item.isCompleted) uncomplete.mutate()
              else complete.mutate()
            }}
            className={
              "grid place-items-center size-12 -my-3 -ml-3 rounded-3xl shrink-0 " +
              (item.isCompleted ? "text-brand" : "text-ink-muted")
            }
          >
            <CheckboxIcon size={24} weight="duotone" />
          </button>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              className={
                "text-[16px] leading-tight truncate " +
                (item.isCompleted ? "text-ink-muted line-through" : "text-ink")
              }
            >
              {item.productName}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              {(item.quantity != null || item.unit) && (
                <span className="text-[12.5px] text-ink-muted tabular-nums">
                  {item.quantity ?? ""} {item.unit ?? ""}
                </span>
              )}
              <ExpiryBadge expiresOn={item.expiresOn} />
              {item.note && (
                <span className="text-[11.5px] text-ink-muted truncate">— {item.note}</span>
              )}
            </span>
          </div>
          <DotsSixVertical size={20} weight="duotone" className="text-line shrink-0" />
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
