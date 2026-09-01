import { create } from "zustand"

export type UndoEntry = {
  id: string
  label: string
  onCommit: () => void
  onUndo?: () => void
  scheduledAt: number
  delayMs: number
  timeoutHandle: ReturnType<typeof setTimeout>
}

type State = {
  entries: UndoEntry[]
  push: (opts: {
    label: string
    onCommit: () => void
    onUndo?: () => void
    delayMs?: number
  }) => void
  undo: (id: string) => void
}

export const useUndoQueue = create<State>((set, get) => ({
  entries: [],
  push: ({ label, onCommit, onUndo, delayMs = 5000 }) => {
    const id = crypto.randomUUID()
    const handle = setTimeout(() => {
      const entry = get().entries.find((e) => e.id === id)
      if (!entry) return
      entry.onCommit()
      set({ entries: get().entries.filter((e) => e.id !== id) })
    }, delayMs)
    set({
      entries: [
        ...get().entries,
        { id, label, onCommit, onUndo, scheduledAt: Date.now(), delayMs, timeoutHandle: handle },
      ],
    })
  },
  undo: (id) => {
    const entry = get().entries.find((e) => e.id === id)
    if (!entry) return
    clearTimeout(entry.timeoutHandle)
    entry.onUndo?.()
    set({ entries: get().entries.filter((e) => e.id !== id) })
  },
}))
