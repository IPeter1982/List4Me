import { useUndoQueue } from "@/shared/useUndoQueue"

export function UndoToast() {
  const entries = useUndoQueue((s) => s.entries)
  const undo = useUndoQueue((s) => s.undo)
  if (entries.length === 0) return null
  return (
    <div
      className="pointer-events-none fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 flex-col gap-1"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {entries.map((e) => (
        <div
          key={e.id}
          className="pointer-events-auto flex items-center gap-3 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-white dark:text-neutral-900"
        >
          <span>{e.label}</span>
          <button
            type="button"
            className="rounded-full bg-white/20 dark:bg-neutral-900/20 px-3 py-0.5 text-xs uppercase"
            onClick={() => undo(e.id)}
          >
            Vissza
          </button>
        </div>
      ))}
    </div>
  )
}
