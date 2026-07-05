import { useMemo, useState } from "react"
import { getIcon, iconKeys } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/cn"

export function IconPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const [q, setQ] = useState("")
  const filtered = useMemo(
    () => iconKeys.filter(k => k.toLowerCase().includes(q.toLowerCase())),
    [q]
  )
  return (
    <div className="space-y-2">
      <Input
        aria-label="Ikon keresés"
        placeholder="Ikon keresés…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1 border rounded-lg">
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
                "aspect-square rounded-lg flex items-center justify-center",
                "hover:bg-neutral-100 transition-colors",
                active && "ring-2 ring-brand bg-blue-50"
              )}
            >
              <Icon className="size-6" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
