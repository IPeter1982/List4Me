import type { ReactNode } from "react"
import { BottomNav } from "./BottomNav"

export function PageShell({
  children,
  title,
  subtitle,
  action
}: {
  children: ReactNode
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-bg text-ink">
      <header className="flex items-start justify-between gap-3 px-6 pt-4 pb-2">
        <div className="px-1">
          {subtitle && (
            <div className="text-[12.5px] font-medium tracking-wide text-brand">
              {subtitle}
            </div>
          )}
          <h1 className="text-[30px] leading-tight font-normal tracking-tight mt-1">
            {title}
          </h1>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <main className="flex-1 px-4 pb-28">{children}</main>
      <BottomNav />
    </div>
  )
}
