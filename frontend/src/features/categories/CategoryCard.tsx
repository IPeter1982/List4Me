import { getIcon } from "@/lib/icons"
import type { Category } from "./types"

export function CategoryCard({
  category,
  meta,
  onClick
}: {
  category: Category
  meta?: string
  onClick: () => void
}) {
  const Icon = getIcon(category.iconKey)
  const fallback = category.subcategories.length > 0
    ? `${category.subcategories.length} alkategória`
    : undefined
  const line = meta ?? fallback

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-1.5 min-h-[136px] p-4 rounded-2xl
                 bg-surface-raised text-ink text-left active:scale-[.96] transition"
    >
      <span
        className="grid place-items-center w-11 h-11 rounded-[14px] mb-auto"
        style={{ background: "var(--priCont)", color: "var(--priInk)" }}
      >
        <Icon size={24} weight="duotone" />
      </span>
      <span className="text-[17px] font-medium leading-tight line-clamp-2">{category.name}</span>
      {line && <span className="text-[12.5px] text-ink-muted">{line}</span>}
    </button>
  )
}
