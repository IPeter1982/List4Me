import { getIcon } from "@/lib/icons"
import type { Category } from "./types"

export function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  const Icon = getIcon(category.iconKey)
  return (
    <button
      onClick={onClick}
      className="aspect-square w-full rounded-2xl bg-white border shadow-sm
                 flex flex-col items-center justify-center gap-2 p-4
                 hover:shadow-md active:scale-[.98] transition
                 dark:bg-neutral-900"
    >
      <Icon className="size-10 text-brand" />
      <span className="text-sm font-medium text-center line-clamp-2">{category.name}</span>
      {category.subcategories.length > 0 && (
        <span className="text-xs text-neutral-500">{category.subcategories.length} alkategória</span>
      )}
    </button>
  )
}
