import { NavLink } from "react-router"
import { SquaresFour, ListChecks, BookmarkSimple, GearSix } from "@phosphor-icons/react"
import { cn } from "@/lib/cn"

const tabs = [
  { to: "/", label: "Kategóriák", icon: SquaresFour },
  { to: "/lists", label: "Listák", icon: ListChecks },
  { to: "/templates", label: "Sablonok", icon: BookmarkSimple },
  { to: "/settings", label: "Beállítások", icon: GearSix }
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-bar pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: "inset 0 1px 0 var(--line)" }}
    >
      <ul className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center gap-1 min-h-16 pt-2 pb-2.5",
                isActive ? "text-ink font-medium" : "text-ink-muted"
              )}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="grid place-items-center w-14 h-8 rounded-2xl"
                    style={{ background: isActive ? "var(--priCont)" : "transparent" }}
                  >
                    <Icon size={22} weight="duotone" />
                  </span>
                  <span className="text-[11.5px] tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="h-6 grid place-items-center">
        <span className="w-[108px] h-[3px] rounded-full bg-bar-ink/35" />
      </div>
    </nav>
  )
}
