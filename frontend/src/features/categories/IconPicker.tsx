import { useMemo, useState } from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { getIcon, iconKeys } from "@/lib/icons"
import { cn } from "@/lib/cn"

export function IconPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const [q, setQ] = useState("")
  const filtered = useMemo(
    () => iconKeys.filter(k => k.toLowerCase().includes(q.toLowerCase())),
    [q]
  )
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 min-h-11 px-3 rounded-xl bg-surface-raised">
        <MagnifyingGlass size={16} weight="duotone" className="text-ink-muted shrink-0" />
        <input
          aria-label="Ikon keresés"
          placeholder="Ikon keresés…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="flex-1 min-w-0 h-10 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-muted"
        />
      </div>
      <div className="grid grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1 -mr-1">
        {filtered.map(k => {
          const Icon = getIcon(k)
          const active = k === value
          return (
            <button
              type="button"
              key={k}
              onClick={() => onChange(k)}
              title={k}
              className={cn(
                "w-14 h-14 grid place-items-center rounded-2xl border-[1.5px] transition",
                active ? "border-brand" : "border-line hover:bg-surface-raised"
              )}
              style={active ? { background: "var(--priCont)", color: "var(--priInk)" } : undefined}
            >
              <Icon size={26} weight="duotone" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
