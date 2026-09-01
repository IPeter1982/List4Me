import { useEffect, useState } from "react"
import { useUndoQueue, type UndoEntry } from "@/shared/useUndoQueue"

export function UndoToast() {
  const entries = useUndoQueue((s) => s.entries)
  const undo = useUndoQueue((s) => s.undo)
  if (entries.length === 0) return null
  return (
    <div
      className="pointer-events-none fixed left-3 right-3 z-40 flex flex-col gap-2"
      style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
    >
      {entries.map((e) => (
        <SnackRow key={e.id} entry={e} onUndo={() => undo(e.id)} />
      ))}
    </div>
  )
}

function SnackRow({ entry, onUndo }: { entry: UndoEntry; onUndo: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((entry.scheduledAt + entry.delayMs - Date.now()) / 1000)),
  )

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.ceil((entry.scheduledAt + entry.delayMs - Date.now()) / 1000))
      setSecondsLeft(left)
    }
    tick()
    const iv = window.setInterval(tick, 250)
    return () => window.clearInterval(iv)
  }, [entry.scheduledAt, entry.delayMs])

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 min-h-[52px] rounded-lg py-2 pl-[18px] pr-3 shadow-[0_4px_14px_rgba(0,0,0,.3)]"
      style={{
        background: "var(--ink)",
        color: "var(--bg)",
        animation: "l4m-snack-in .24s cubic-bezier(.2,0,0,1)",
      }}
    >
      <span className="flex-1 text-sm">{entry.label}</span>
      <span className="text-xs opacity-60 tabular-nums">{secondsLeft}s</span>
      <button
        type="button"
        onClick={onUndo}
        className="min-h-10 px-3.5 rounded-full text-sm font-bold tracking-wider"
        style={{ color: "var(--pri)" }}
      >
        VISSZA
      </button>
    </div>
  )
}
