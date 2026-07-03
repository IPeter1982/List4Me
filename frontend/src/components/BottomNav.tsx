import { NavLink } from "react-router"
import { LayoutGrid, ListChecks, ClipboardList, Settings } from "lucide-react"
import { cn } from "@/lib/cn"

const tabs = [
  { to: "/", label: "Kategóriák", icon: LayoutGrid },
  { to: "/lists", label: "Listák", icon: ListChecks },
  { to: "/templates", label: "Sablonok", icon: ClipboardList },
  { to: "/settings", label: "Beállítások", icon: Settings }
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white/90 backdrop-blur
                    pb-[env(safe-area-inset-bottom)] z-30 dark:bg-neutral-900/90">
      <ul className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center py-2 gap-0.5 text-xs",
                isActive ? "text-brand" : "text-neutral-500"
              )}
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
