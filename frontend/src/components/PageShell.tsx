import type { ReactNode } from "react"
import { BottomNav } from "./BottomNav"

export function PageShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b dark:bg-neutral-900/90">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  )
}
